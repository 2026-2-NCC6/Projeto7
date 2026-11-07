import type { TargetColor } from '../../../types/game';
import type { LevelConfig } from '../../domain/game-rules';
import { INFINITE_LEVEL } from '../mode-catalog';
import type { StreakMultiplier } from '../shared/scoring';
import type { TimeBudget } from '../shared/time-budget';

export interface InfiniteScoreConfig extends LevelConfig {
  readonly pointsPerColor: Record<TargetColor, number>;
  readonly palette: readonly TargetColor[];
  readonly streakMultiplier: StreakMultiplier | null;
  /** Points lost by hitting outside the palette; zero or negative. */
  readonly missPenalty: number;
  readonly timeBudget: TimeBudget;
}

/**
 * `baseBonusMs` sits at the pace the hardest Score Mode level demands (~2.8 s per
 * ball), so the bank only grows while the player is beating level 20's rhythm.
 */
export const infiniteScoreLevels: readonly InfiniteScoreConfig[] = [
  {
    level: INFINITE_LEVEL,
    difficulty: 'expert',
    recoveryMs: 110,
    pointsPerColor: { amber: 10, blue: 20, red: 30 },
    palette: ['amber', 'blue', 'red'],
    streakMultiplier: { every: 5, step: 0.25, max: 2.5 },
    missPenalty: -10,
    timeBudget: {
      startBudgetMs: 20000,
      baseBonusMs: 3000,
      minBonusMs: 500,
      bonusDecayPerStep: 0.88,
      stepScore: 150,
      missPenaltyMs: 1500,
    },
  },
];
