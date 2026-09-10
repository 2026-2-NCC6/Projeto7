import type {
  DeviceConnectionStatus,
  DeviceEvent,
  TargetHitEvent,
  TargetId,
} from '../../device/contracts';
import type { TargetColor } from '../../types/game';
import type {
  GameRules,
  LevelConfig,
  RandomSource,
  RoundOutcome,
} from './game-rules';
import type { AttemptRecord } from './metrics/attempt-record';
import { isPlaying, isTerminal, type HitVerdict, type SessionPhase } from './session-phase';

export const PREPARE_COUNTDOWN_MS = 3000;

export type GameInput =
  | { readonly kind: 'deviceEvent'; readonly event: DeviceEvent }
  | { readonly kind: 'tick'; readonly deltaMs: number }
  | { readonly kind: 'pause' }
  | { readonly kind: 'resume' };

export interface SessionFeedback {
  readonly seq: number;
  readonly verdict: HitVerdict;
  readonly targetId: TargetId | null;
  readonly color: TargetColor | null;
  readonly scoreDelta: number;
}

export interface GameSession<TState> {
  readonly phase: SessionPhase;
  readonly modeState: TState;
  readonly score: number;
  readonly progress: number;
  readonly sessionElapsedMs: number;
  readonly promptElapsedMs: number;
  readonly deviceStatus: DeviceConnectionStatus;
  readonly records: readonly AttemptRecord[];
  readonly feedback: SessionFeedback | null;
  readonly startedAt: number;
}

export interface StartSessionInput<TConfig extends LevelConfig, TState> {
  readonly rules: GameRules<TConfig, TState>;
  readonly config: TConfig;
  readonly random: RandomSource;
  readonly deviceStatus: DeviceConnectionStatus;
  readonly startedAt: number;
}

export function startSession<TConfig extends LevelConfig, TState>({
  rules,
  config,
  random,
  deviceStatus,
  startedAt,
}: StartSessionInput<TConfig, TState>): GameSession<TState> {
  return {
    phase:
      deviceStatus === 'connected'
        ? { kind: 'preparing', remainingMs: PREPARE_COUNTDOWN_MS }
        : { kind: 'deviceLost' },
    modeState: rules.start(config, random),
    score: 0,
    progress: 0,
    sessionElapsedMs: 0,
    promptElapsedMs: 0,
    deviceStatus,
    records: [],
    feedback: null,
    startedAt,
  };
}

function phaseFor<TState>(
  outcome: RoundOutcome<TState>,
  config: LevelConfig,
): SessionPhase {
  if (outcome.resolution === 'cleared') {
    return { kind: 'levelCleared' };
  }

  if (outcome.resolution === 'failed') {
    return { kind: 'levelFailed', reason: outcome.failureReason ?? 'mistakesExhausted' };
  }

  return { kind: 'resolving', verdict: outcome.verdict, remainingMs: config.recoveryMs };
}

function timeoutRecord<TState>(session: GameSession<TState>): AttemptRecord {
  return {
    atMs: session.sessionElapsedMs,
    responseMs: session.promptElapsedMs,
    verdict: 'incorrect',
    targetId: null,
    color: null,
    scoreDelta: 0,
    impact: null,
  };
}

function applyOutcome<TState>(
  session: GameSession<TState>,
  outcome: RoundOutcome<TState>,
  config: LevelConfig,
  record: AttemptRecord | null,
): GameSession<TState> {
  return {
    ...session,
    phase: phaseFor(outcome, config),
    modeState: outcome.state,
    score: session.score + outcome.scoreDelta,
    progress: outcome.progress,
    promptElapsedMs: 0,
    records: record ? [...session.records, record] : session.records,
    feedback: record
      ? {
          seq: session.records.length + 1,
          verdict: record.verdict,
          targetId: record.targetId,
          color: record.color,
          scoreDelta: record.scoreDelta,
        }
      : session.feedback,
  };
}

function onDeviceStatus<TState>(
  session: GameSession<TState>,
  status: DeviceConnectionStatus,
): GameSession<TState> {
  if (isTerminal(session.phase)) {
    return { ...session, deviceStatus: status };
  }

  if (status !== 'connected') {
    return { ...session, deviceStatus: status, phase: { kind: 'deviceLost' } };
  }

  const recovered: SessionPhase =
    session.phase.kind === 'deviceLost'
      ? { kind: 'preparing', remainingMs: PREPARE_COUNTDOWN_MS }
      : session.phase;

  return { ...session, deviceStatus: status, phase: recovered, promptElapsedMs: 0 };
}

function onHit<TConfig extends LevelConfig, TState>(
  session: GameSession<TState>,
  hit: TargetHitEvent,
  rules: GameRules<TConfig, TState>,
  config: TConfig,
): GameSession<TState> {
  if (session.phase.kind !== 'awaitingHit') {
    return session;
  }

  const outcome = rules.onHit(session.modeState, hit, config);

  const record: AttemptRecord = {
    atMs: session.sessionElapsedMs,
    responseMs: session.promptElapsedMs,
    verdict: outcome.verdict,
    targetId: hit.targetId,
    color: hit.color,
    scoreDelta: outcome.scoreDelta,
    impact: hit.impact,
  };

  return applyOutcome(session, outcome, config, record);
}

function onTick<TConfig extends LevelConfig, TState>(
  session: GameSession<TState>,
  deltaMs: number,
  rules: GameRules<TConfig, TState>,
  config: TConfig,
): GameSession<TState> {
  if (!isPlaying(session.phase)) {
    return session;
  }

  const advanced: GameSession<TState> = {
    ...session,
    sessionElapsedMs: session.sessionElapsedMs + deltaMs,
    promptElapsedMs: session.promptElapsedMs + deltaMs,
  };

  if (advanced.phase.kind === 'preparing') {
    const remainingMs = advanced.phase.remainingMs - deltaMs;

    // The countdown never counts against the session clock, and resuming after a
    // pause or a reconnect picks it up where it stopped instead of rewinding it.
    return remainingMs > 0
      ? { ...advanced, phase: { kind: 'preparing', remainingMs }, sessionElapsedMs: session.sessionElapsedMs }
      : {
          ...advanced,
          phase: { kind: 'awaitingHit' },
          sessionElapsedMs: session.sessionElapsedMs,
          promptElapsedMs: 0,
        };
  }

  if (advanced.phase.kind === 'resolving') {
    const remainingMs = advanced.phase.remainingMs - deltaMs;

    return remainingMs > 0
      ? { ...advanced, phase: { ...advanced.phase, remainingMs } }
      : { ...advanced, phase: { kind: 'awaitingHit' }, promptElapsedMs: 0 };
  }

  const outcome = rules.onElapsed(
    advanced.modeState,
    { sessionElapsedMs: advanced.sessionElapsedMs, promptElapsedMs: advanced.promptElapsedMs },
    config,
  );

  if (!outcome) {
    return advanced;
  }

  return applyOutcome(
    advanced,
    outcome,
    config,
    outcome.missedAttempt ? timeoutRecord(advanced) : null,
  );
}

export function applyInput<TConfig extends LevelConfig, TState>(
  session: GameSession<TState>,
  input: GameInput,
  rules: GameRules<TConfig, TState>,
  config: TConfig,
): GameSession<TState> {
  switch (input.kind) {
    case 'deviceEvent':
      if (input.event.kind === 'status') {
        return onDeviceStatus(session, input.event.status);
      }
      if (input.event.kind === 'targetHit') {
        return onHit(session, input.event, rules, config);
      }
      return session;

    case 'tick':
      return onTick(session, input.deltaMs, rules, config);

    case 'pause':
      return isPlaying(session.phase) ? { ...session, phase: { kind: 'paused' } } : session;

    case 'resume':
      return session.phase.kind === 'paused'
        ? { ...session, phase: { kind: 'preparing', remainingMs: PREPARE_COUNTDOWN_MS } }
        : session;
  }
}
