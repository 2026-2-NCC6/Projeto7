import type { TargetColor } from '../../../types/game';
import type { LevelConfig } from '../../domain/game-rules';
import { INFINITE_LEVEL } from '../mode-catalog';
import type { TimeBudget } from '../shared/time-budget';

export interface InfiniteColorConfig extends LevelConfig {
  readonly palette: readonly TargetColor[];
  readonly pointsPerHit: number;
  /** Colours are drawn up front and cycled, since the run has no end. */
  readonly promptQueueLength: number;
  readonly timeBudget: TimeBudget;
}

/**
 * One configuration, and it carries the whole difficulty curve. `baseBonusMs` sits at
 * the pace of the last Color Mode levels (1.7-2.0 s per prompt), so even a fast player
 * barely gains time at the start and every player loses ground eventually.
 */
export const infiniteColorLevels: readonly InfiniteColorConfig[] = [
  {
    level: INFINITE_LEVEL,
    difficulty: 'expert',
    recoveryMs: 400,
    palette: ['amber', 'blue', 'red'],
    pointsPerHit: 20,
    promptQueueLength: 400,
    timeBudget: {
      startBudgetMs: 18000,
      baseBonusMs: 2600,
      minBonusMs: 500,
      bonusDecayPerStep: 0.88,
      stepScore: 100,
      missPenaltyMs: 2000,
    },
  },
];
