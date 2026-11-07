import type { TargetId } from '../../../device/contracts';
import type { TargetColor } from '../../../types/game';

export interface ResponseMetrics {
  readonly averageMs: number;
  readonly fastestMs: number;
  readonly slowestMs: number;
}

export interface ImpactMetrics {
  readonly averageRaw: number;
  readonly maxRaw: number;
  readonly minRaw: number;
  readonly consistencyPercent: number;
  /** True while the readings come from the simulator instead of the wall. */
  readonly simulated: boolean;
}

export interface TargetMetrics {
  readonly targetId: TargetId;
  readonly color: TargetColor;
  readonly attempts: number;
  readonly correctHits: number;
  readonly impact: ImpactMetrics | null;
}

export interface SessionMetrics {
  readonly level: number;
  readonly durationMs: number;
  readonly totalAttempts: number;
  readonly correctHits: number;
  readonly incorrectHits: number;
  readonly accuracyPercent: number | null;
  readonly longestCorrectStreak: number;
  readonly finalScore: number;
  readonly completionPercent: number;
  readonly response: ResponseMetrics | null;
  readonly perTarget: readonly TargetMetrics[];
  readonly impact: ImpactMetrics | null;
}
