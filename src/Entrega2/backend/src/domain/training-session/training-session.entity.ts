import { GameMode } from '../game/game-mode';
import { DeviceKind } from './device-kind';
import { InvalidTrainingSessionError } from './errors';
import {
  EndReason,
  MAX_RECORDED_ATTEMPTS,
  MAX_STOP_REASON_LENGTH,
  NO_INTERRUPTIONS,
  SessionAttempt,
  SessionInterruptions,
  TrainingRef,
} from './session-context';
import { IMPACT_MAX_RAW, TargetPerformance, WALL_TARGET_COUNT } from './target-performance';

export interface TrainingSessionProps {
  id: string;
  /** The ticket the session was opened with; null only for sessions recorded before tickets. */
  ticketId: string | null;
  userId: string;
  mode: GameMode;
  level: number;
  cleared: boolean;
  score: number;
  hits: number;
  misses: number;
  bestStreak: number;
  durationMs: number;
  avgResponseMs: number | null;
  bestResponseMs: number | null;
  xpAwarded: number;
  deviceKind: DeviceKind;
  targets: TargetPerformance[];
  training: TrainingRef | null;
  endReason: EndReason | null;
  stopReason: string | null;
  interruptions: SessionInterruptions;
  offline: boolean;
  clientSessionId: string | null;
  deviceId: string | null;
  attempts: SessionAttempt[];
  playedAt: Date;
}

type ContextKey =
  | 'training'
  | 'endReason'
  | 'stopReason'
  | 'interruptions'
  | 'offline'
  | 'clientSessionId'
  | 'deviceId'
  | 'attempts'
  | 'playedAt';

export type RecordedSessionProps = Omit<TrainingSessionProps, ContextKey> &
  Partial<Pick<TrainingSessionProps, ContextKey>>;

function sumOf(targets: TargetPerformance[], pick: (target: TargetPerformance) => number): number {
  return targets.reduce((total, target) => total + pick(target), 0);
}

function isImpactInRange(value: number | null): boolean {
  return value === null || (value >= 0 && value <= IMPACT_MAX_RAW);
}

function assertConsistentTargets({ targets, hits, misses }: TrainingSessionProps): void {
  const ids = targets.map((target) => target.targetId);

  if (ids.some((id) => !Number.isInteger(id) || id < 1 || id > WALL_TARGET_COUNT)) {
    throw new InvalidTrainingSessionError('alvo fora da parede.');
  }
  if (new Set(ids).size !== ids.length) {
    throw new InvalidTrainingSessionError('alvo repetido.');
  }
  if (targets.some((target) => target.correctHits > target.attempts)) {
    throw new InvalidTrainingSessionError('acertos acima das tentativas de um alvo.');
  }
  if (
    targets.some(
      (target) => !isImpactInRange(target.impactAverage) || !isImpactInRange(target.impactPeak),
    )
  ) {
    throw new InvalidTrainingSessionError('impacto fora da escala do sensor.');
  }
  if (
    sumOf(targets, (target) => target.correctHits) > hits ||
    sumOf(targets, (target) => target.attempts) > hits + misses ||
    sumOf(targets, (target) => target.attempts - target.correctHits) > misses
  ) {
    throw new InvalidTrainingSessionError('alvos não batem com o total da sessão.');
  }
}

/** The wall's debounce: it never reports two impacts closer than this. */
export const MIN_ATTEMPT_INTERVAL_MS = 200;
/**
 * Well above the richest hit in any level table (40 points at a 3x streak
 * multiplier). A table that pays more per hit has to raise it.
 */
export const MAX_POINTS_PER_HIT = 150;

/** Numbers no real session can produce, whatever the client claims. */
function assertPlausible({ hits, misses, score, durationMs }: TrainingSessionProps): void {
  if (hits + misses > Math.floor(durationMs / MIN_ATTEMPT_INTERVAL_MS) + 1) {
    throw new InvalidTrainingSessionError('mais batidas do que cabem na duração.');
  }
  if (score > hits * MAX_POINTS_PER_HIT) {
    throw new InvalidTrainingSessionError('pontuação acima do máximo possível.');
  }
}

function assertConsistentAttempts({ attempts, hits, misses, durationMs }: TrainingSessionProps): void {
  if (attempts.length > MAX_RECORDED_ATTEMPTS || attempts.length > hits + misses) {
    throw new InvalidTrainingSessionError('mais tentativas do que batidas na sessão.');
  }
  if (attempts.filter((attempt) => attempt.verdict === 'correct').length > hits) {
    throw new InvalidTrainingSessionError('mais acertos registrados do que o total.');
  }
  if (
    attempts.some(
      (attempt) =>
        (attempt.targetId !== null &&
          (!Number.isInteger(attempt.targetId) ||
            attempt.targetId < 1 ||
            attempt.targetId > WALL_TARGET_COUNT)) ||
        !isImpactInRange(attempt.intensity) ||
        attempt.atMs < 0 ||
        attempt.atMs > durationMs + MIN_ATTEMPT_INTERVAL_MS,
    )
  ) {
    throw new InvalidTrainingSessionError('tentativa fora da parede ou da duração.');
  }
}

function withContext(props: RecordedSessionProps): TrainingSessionProps {
  const stopReason = props.stopReason?.trim().slice(0, MAX_STOP_REASON_LENGTH) || null;

  return {
    ...props,
    training: props.training ?? null,
    endReason: props.endReason ?? (props.cleared ? 'cleared' : null),
    stopReason: props.endReason === 'emergencyStop' ? stopReason : null,
    interruptions: props.interruptions ?? NO_INTERRUPTIONS,
    offline: props.offline ?? false,
    clientSessionId: props.clientSessionId ?? null,
    deviceId: props.deviceId ?? null,
    attempts: props.attempts ?? [],
    playedAt: props.playedAt ?? new Date(),
  };
}

export class TrainingSession {
  private constructor(private readonly props: TrainingSessionProps) {}

  static restore(props: TrainingSessionProps): TrainingSession {
    return new TrainingSession(props);
  }

  static record(props: RecordedSessionProps): TrainingSession {
    const session = withContext(props);
    assertConsistentTargets(session);
    assertConsistentAttempts(session);
    assertPlausible(session);
    return new TrainingSession(session);
  }

  get id(): string {
    return this.props.id;
  }

  get ticketId(): string | null {
    return this.props.ticketId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get mode(): GameMode {
    return this.props.mode;
  }

  get level(): number {
    return this.props.level;
  }

  get cleared(): boolean {
    return this.props.cleared;
  }

  get score(): number {
    return this.props.score;
  }

  get hits(): number {
    return this.props.hits;
  }

  get misses(): number {
    return this.props.misses;
  }

  get bestStreak(): number {
    return this.props.bestStreak;
  }

  get durationMs(): number {
    return this.props.durationMs;
  }

  get avgResponseMs(): number | null {
    return this.props.avgResponseMs;
  }

  get bestResponseMs(): number | null {
    return this.props.bestResponseMs;
  }

  get xpAwarded(): number {
    return this.props.xpAwarded;
  }

  get deviceKind(): DeviceKind {
    return this.props.deviceKind;
  }

  get targets(): TargetPerformance[] {
    return this.props.targets;
  }

  get training(): TrainingRef | null {
    return this.props.training;
  }

  get endReason(): EndReason | null {
    return this.props.endReason;
  }

  get stopReason(): string | null {
    return this.props.stopReason;
  }

  get interruptions(): SessionInterruptions {
    return this.props.interruptions;
  }

  get offline(): boolean {
    return this.props.offline;
  }

  get clientSessionId(): string | null {
    return this.props.clientSessionId;
  }

  get deviceId(): string | null {
    return this.props.deviceId;
  }

  get attempts(): SessionAttempt[] {
    return this.props.attempts;
  }

  get playedAt(): Date {
    return this.props.playedAt;
  }
}
