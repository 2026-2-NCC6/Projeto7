import { GameMode } from '../game/game-mode';
import { DeviceKind } from './device-kind';
import { InvalidTrainingSessionError } from './errors';
import { IMPACT_MAX_RAW, TargetPerformance, WALL_TARGET_COUNT } from './target-performance';

export interface TrainingSessionProps {
  id: string;
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
  playedAt: Date;
}

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
    sumOf(targets, (target) => target.attempts) > hits + misses
  ) {
    throw new InvalidTrainingSessionError('alvos não batem com o total da sessão.');
  }
}

export class TrainingSession {
  private constructor(private readonly props: TrainingSessionProps) {}

  static restore(props: TrainingSessionProps): TrainingSession {
    return new TrainingSession(props);
  }

  static record(props: Omit<TrainingSessionProps, 'playedAt'>): TrainingSession {
    const session: TrainingSessionProps = { ...props, playedAt: new Date() };
    assertConsistentTargets(session);
    return new TrainingSession(session);
  }

  get id(): string {
    return this.props.id;
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

  get playedAt(): Date {
    return this.props.playedAt;
  }
}
