export const WALL_TARGET_COUNT = 6;

export const IMPACT_MAX_RAW = 4095;

export interface TargetPerformance {
  targetId: number;
  attempts: number;
  correctHits: number;
  impactAverage: number | null;
  impactPeak: number | null;
}
