import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useDevice } from '../../device/runtime/useDevice';
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
}

export function useGameSession<TState>({
  mode,
  level,
}: UseGameSessionInput): GameSessionController<TState> | null {
  const { device, status } = useDevice();
  const rules = useMemo(() => rulesFor(mode) as GameRules<LevelConfig, TState>, [mode]);
  const config = useMemo(() => levelOf(rules.levels, level), [rules, level]);

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
    setSession(
      startSession({
        rules,
        config,
        random: Math.random,
        deviceStatus: device.status,
        startedAt: Date.now(),
      }),
    );
  }, [config, rules, device]);

  useEffect(() => {
    return device.subscribe((event) => dispatch({ kind: 'deviceEvent', event }));
  }, [device, dispatch]);

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
    }
  }, [session?.feedback]);

  useEffect(() => {
    if (session && isTerminal(session.phase) && !outcomeAnnounced.current) {
      outcomeAnnounced.current = true;
      pulseOutcome(session.phase.kind === 'levelCleared');
    }
  }, [session]);

  const result = useMemo<SessionResult | null>(() => {
    if (!session || !config || !isTerminal(session.phase)) {
      return null;
    }

    const cleared = session.phase.kind === 'levelCleared';

    return {
      mode,
      level: config.level,
      cleared,
      failureReason: session.phase.kind === 'levelFailed' ? session.phase.reason : null,
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
    };
  }, [session, config, mode, device]);

  if (!session || !config) {
    return null;
  }

  return { session, config, result };
}
