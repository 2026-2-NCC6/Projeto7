import type { TargetColor } from '../../../types/game';
import type { LevelConfig } from '../../domain/game-rules';
import type { StreakMultiplier } from '../shared/scoring';

export interface ScoreLevelConfig extends LevelConfig {
  readonly targetScore: number;
  readonly timeLimitMs: number | null;
  readonly pointsPerColor: Record<TargetColor, number>;
  /** Colours that score this level. Hitting anything else is a miss. */
  readonly palette: readonly TargetColor[];
  readonly streakMultiplier: StreakMultiplier | null;
  /** Points lost on a miss. Zero or negative. */
  readonly missPenalty: number;
  readonly requiredAccuracyPercent: number | null;
}

const ALL: readonly TargetColor[] = ['amber', 'blue', 'red'];
const HIGH: readonly TargetColor[] = ['blue', 'red'];
const RED_ONLY: readonly TargetColor[] = ['red'];

const BASE = { amber: 10, blue: 20, red: 30 } as const;
const RICH = { amber: 15, blue: 25, red: 40 } as const;

const SECOND = 1000;

export const scoreLevels: readonly ScoreLevelConfig[] = [
  { level: 1, difficulty: 'intro', targetScore: 100, timeLimitMs: null, pointsPerColor: BASE, palette: ALL, streakMultiplier: null, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 140 },
  { level: 2, difficulty: 'intro', targetScore: 150, timeLimitMs: null, pointsPerColor: BASE, palette: ALL, streakMultiplier: null, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 140 },
  { level: 3, difficulty: 'intro', targetScore: 200, timeLimitMs: null, pointsPerColor: BASE, palette: ALL, streakMultiplier: null, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 130 },
  { level: 4, difficulty: 'intro', targetScore: 260, timeLimitMs: null, pointsPerColor: BASE, palette: ALL, streakMultiplier: null, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 130 },

  { level: 5, difficulty: 'easy', targetScore: 320, timeLimitMs: 120 * SECOND, pointsPerColor: BASE, palette: ALL, streakMultiplier: null, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 130 },
  { level: 6, difficulty: 'easy', targetScore: 380, timeLimitMs: 115 * SECOND, pointsPerColor: BASE, palette: ALL, streakMultiplier: { every: 5, step: 0.25, max: 2 }, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 120 },
  { level: 7, difficulty: 'easy', targetScore: 440, timeLimitMs: 110 * SECOND, pointsPerColor: BASE, palette: ALL, streakMultiplier: { every: 5, step: 0.25, max: 2 }, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 120 },

  { level: 8, difficulty: 'medium', targetScore: 500, timeLimitMs: 100 * SECOND, pointsPerColor: BASE, palette: ALL, streakMultiplier: { every: 5, step: 0.25, max: 2 }, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 120 },
  { level: 9, difficulty: 'medium', targetScore: 560, timeLimitMs: 95 * SECOND, pointsPerColor: BASE, palette: HIGH, streakMultiplier: { every: 5, step: 0.25, max: 2 }, missPenalty: 0, requiredAccuracyPercent: null, recoveryMs: 110 },
  { level: 10, difficulty: 'medium', targetScore: 620, timeLimitMs: 90 * SECOND, pointsPerColor: BASE, palette: HIGH, streakMultiplier: { every: 5, step: 0.25, max: 2 }, missPenalty: -10, requiredAccuracyPercent: null, recoveryMs: 110 },
  { level: 11, difficulty: 'medium', targetScore: 680, timeLimitMs: 85 * SECOND, pointsPerColor: RICH, palette: HIGH, streakMultiplier: { every: 4, step: 0.25, max: 2.5 }, missPenalty: -10, requiredAccuracyPercent: null, recoveryMs: 110 },
  { level: 12, difficulty: 'medium', targetScore: 740, timeLimitMs: 80 * SECOND, pointsPerColor: RICH, palette: HIGH, streakMultiplier: { every: 4, step: 0.25, max: 2.5 }, missPenalty: -15, requiredAccuracyPercent: null, recoveryMs: 100 },

  { level: 13, difficulty: 'hard', targetScore: 800, timeLimitMs: 75 * SECOND, pointsPerColor: RICH, palette: HIGH, streakMultiplier: { every: 4, step: 0.25, max: 2.5 }, missPenalty: -15, requiredAccuracyPercent: 60, recoveryMs: 100 },
  { level: 14, difficulty: 'hard', targetScore: 870, timeLimitMs: 70 * SECOND, pointsPerColor: RICH, palette: HIGH, streakMultiplier: { every: 4, step: 0.25, max: 2.5 }, missPenalty: -15, requiredAccuracyPercent: 60, recoveryMs: 100 },
  { level: 15, difficulty: 'hard', targetScore: 940, timeLimitMs: 65 * SECOND, pointsPerColor: RICH, palette: HIGH, streakMultiplier: { every: 3, step: 0.25, max: 3 }, missPenalty: -20, requiredAccuracyPercent: 65, recoveryMs: 90 },
  { level: 16, difficulty: 'hard', targetScore: 1000, timeLimitMs: 60 * SECOND, pointsPerColor: RICH, palette: HIGH, streakMultiplier: { every: 3, step: 0.25, max: 3 }, missPenalty: -20, requiredAccuracyPercent: 65, recoveryMs: 90 },
  { level: 17, difficulty: 'hard', targetScore: 1060, timeLimitMs: 58 * SECOND, pointsPerColor: RICH, palette: RED_ONLY, streakMultiplier: { every: 3, step: 0.25, max: 3 }, missPenalty: -20, requiredAccuracyPercent: 70, recoveryMs: 90 },

  { level: 18, difficulty: 'expert', targetScore: 1120, timeLimitMs: 54 * SECOND, pointsPerColor: RICH, palette: RED_ONLY, streakMultiplier: { every: 3, step: 0.3, max: 3 }, missPenalty: -25, requiredAccuracyPercent: 70, recoveryMs: 80 },
  { level: 19, difficulty: 'expert', targetScore: 1180, timeLimitMs: 50 * SECOND, pointsPerColor: RICH, palette: RED_ONLY, streakMultiplier: { every: 3, step: 0.3, max: 3 }, missPenalty: -25, requiredAccuracyPercent: 75, recoveryMs: 80 },
  { level: 20, difficulty: 'expert', targetScore: 1250, timeLimitMs: 45 * SECOND, pointsPerColor: RICH, palette: RED_ONLY, streakMultiplier: { every: 3, step: 0.3, max: 3 }, missPenalty: -25, requiredAccuracyPercent: 75, recoveryMs: 80 },
];
