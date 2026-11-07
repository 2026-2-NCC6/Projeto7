import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useDevice } from '../../device/runtime/useDevice';
import { useAuthStore } from '../../store/authStore';
import type { PlayableModeId } from '../../types/game';
import {
  applyInput,
  startSession,
  type GameInput,
  type GameSession,
} from '../domain/game-session';
import type { GameRules, LevelConfig } from '../domain/game-rules';
import { levelOf } from '../domain/game-rules';
import { collectSessionMetrics } from '../domain/metrics/metrics-collector';
import type { SessionResult } from '../domain/metrics/session-result';
import { isTerminal } from '../domain/session-phase';
import { rulesFor } from '../modes/registry';
import { sessionService } from '../services/sessionService';
import { useSafetyStore } from '../store/safetyStore';
import { refOf, stepOf, type TrainingRun } from '../training/training-run';
import { levelConfigOf } from '../training/training-step';
import { pulseFor, pulseOutcome } from './haptics';

const TICK_MS = 100;

export interface GameSessionController<TState> {
  readonly session: GameSession<TState>;
  readonly config: LevelConfig;
  readonly result: SessionResult | null;
}

export interface UseGameSessionInput {
  readonly mode: PlayableModeId;
  readonly level: number;
  readonly training?: TrainingRun | null;
}


export function useGameSession<TState>({
  mode,
  level,
  training = null,
}: UseGameSessionInput): GameSessionController<TState> | null {
  const { device, status } = useDevice();
  const rules = useMemo(() => rulesFor(mode) as GameRules<LevelConfig, TState>, [mode]);
  const config = useMemo(
    () => (training ? levelConfigOf(stepOf(training), training.difficulty) : levelOf(rules.levels, level)),
    [rules, level, training],
  );
  const stopReason = useSafetyStore((state) => state.reason);

  const [session, setSession] = useState<GameSession<TState> | null>(null);
  const feedbackSeq = useRef(0);
  const outcomeAnnounced = useRef(false);

  const dispatch = useCallback(
    (input: GameInput) => {
      setSession((current) =>
        current && config ? applyInput(current, input, rules, config) : current,
      );
    },
    [config, rules],
  );

  useEffect(() => {
    if (!config) {
      return;
    }

    feedbackSeq.current = 0;
    outcomeAnnounced.current = false;
    const startedAt = Date.now();
    setSession(
      startSession({
        rules,
        config,
        random: Math.random,
        deviceStatus: device.status,
        startedAt,
      }),
    );

    // Only a signed-in player's session is recorded, so only theirs is opened.
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      sessionService.open(
        { mode, level: config.level, ...(training ? { training: refOf(training) } : {}) },
        startedAt,
        accessToken,
      );
    }
  }, [config, rules, device, mode, training]);

  useEffect(() => {
    return device.subscribe((event) => dispatch({ kind: 'deviceEvent', event }));
  }, [device, dispatch]);

  useEffect(
    () =>
      useSafetyStore.subscribe((state, previous) => {
        if (state.locked) {
          dispatch({ kind: 'emergencyStop' });
        } else if (state.stopping !== previous.stopping) {
          dispatch({ kind: state.stopping ? 'pause' : 'resume' });
        }
      }),
    [dispatch],
  );

  useEffect(() => {
    dispatch({ kind: 'deviceEvent', event: { kind: 'status', status, deviceId: device.descriptor.id, at: Date.now() } });
  }, [status, device, dispatch]);

  useEffect(() => {
    const timer = setInterval(() => dispatch({ kind: 'tick', deltaMs: TICK_MS }), TICK_MS);
    return () => clearInterval(timer);
  }, [dispatch]);

  // Walking to the wall locks the phone; the level waits instead of failing.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) =>
      dispatch({ kind: next === 'active' ? 'resume' : 'pause' }),
    );

    return () => subscription.remove();
  }, [dispatch]);

  useEffect(() => {
    const feedback = session?.feedback;

    if (feedback && feedback.seq !== feedbackSeq.current) {
      feedbackSeq.current = feedback.seq;
      pulseFor(feedback.verdict);
      if (!useSafetyStore.getState().locked) {
        device.signal(feedback.verdict === 'correct' ? 'hit' : 'miss');
      }
    }
  }, [session?.feedback, device]);

  useEffect(() => {
    if (session && isTerminal(session.phase) && !outcomeAnnounced.current) {
      outcomeAnnounced.current = true;
      const cleared = session.phase.kind === 'levelCleared';
      pulseOutcome(cleared);
      if (!useSafetyStore.getState().locked) {
        device.signal(cleared ? 'levelCleared' : 'levelFailed');
      }
    }
  }, [session, device]);

  const result = useMemo<SessionResult | null>(() => {
    if (!session || !config || !isTerminal(session.phase)) {
      return null;
    }

    const cleared = session.phase.kind === 'levelCleared';
    const failureReason = session.phase.kind === 'levelFailed' ? session.phase.reason : null;

    return {
      mode,
      level: config.level,
      cleared,
      failureReason,
      startedAt: session.startedAt,
      endedAt: session.startedAt + session.sessionElapsedMs,
      deviceKind: device.descriptor.kind,
      metrics: collectSessionMetrics({
        level: config.level,
        durationMs: session.sessionElapsedMs,
        finalScore: session.score,
        progress: session.progress,
        cleared,
        records: session.records,
      }),
      training: training ? refOf(training) : null,
      stopReason: failureReason === 'emergencyStop' ? stopReason : null,
      interruptions: session.interruptions,
      deviceId: device.descriptor.id,
      records: session.records,
    };
  }, [session, config, mode, device, training, stopReason]);

  if (!session || !config) {
    return null;
  }

  return { session, config, result };
}
