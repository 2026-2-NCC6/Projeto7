import type { TargetColor } from '../../../types/game';
import type { LevelConfig } from '../../domain/game-rules';

export interface ColorLevelConfig extends LevelConfig {
  /** How many prompts the player has to clear in a row. */
  readonly sequenceLength: number;
  readonly palette: readonly TargetColor[];
  /** Time allowed per prompt. Null leaves the level untimed. */
  readonly reactionWindowMs: number | null;
  /** Wrong hits tolerated before the level fails. Null means unlimited. */
  readonly maxMistakes: number | null;
  readonly pointsPerHit: number;
}

const TWO: readonly TargetColor[] = ['amber', 'blue'];
const THREE: readonly TargetColor[] = ['amber', 'blue', 'red'];

export const colorLevels: readonly ColorLevelConfig[] = [
  { level: 1, difficulty: 'intro', sequenceLength: 3, palette: TWO, reactionWindowMs: null, recoveryMs: 900, maxMistakes: null, pointsPerHit: 10 },
  { level: 2, difficulty: 'intro', sequenceLength: 4, palette: TWO, reactionWindowMs: null, recoveryMs: 900, maxMistakes: null, pointsPerHit: 10 },
  { level: 3, difficulty: 'intro', sequenceLength: 4, palette: THREE, reactionWindowMs: null, recoveryMs: 850, maxMistakes: null, pointsPerHit: 12 },

  { level: 4, difficulty: 'easy', sequenceLength: 5, palette: THREE, reactionWindowMs: 4000, recoveryMs: 800, maxMistakes: null, pointsPerHit: 12 },
  { level: 5, difficulty: 'easy', sequenceLength: 5, palette: THREE, reactionWindowMs: 3800, recoveryMs: 750, maxMistakes: null, pointsPerHit: 14 },
  { level: 6, difficulty: 'easy', sequenceLength: 6, palette: THREE, reactionWindowMs: 3600, recoveryMs: 700, maxMistakes: 8, pointsPerHit: 14 },
  { level: 7, difficulty: 'easy', sequenceLength: 6, palette: THREE, reactionWindowMs: 3200, recoveryMs: 650, maxMistakes: 8, pointsPerHit: 16 },

  { level: 8, difficulty: 'medium', sequenceLength: 7, palette: THREE, reactionWindowMs: 3000, recoveryMs: 600, maxMistakes: 6, pointsPerHit: 16 },
  { level: 9, difficulty: 'medium', sequenceLength: 7, palette: THREE, reactionWindowMs: 2850, recoveryMs: 580, maxMistakes: 6, pointsPerHit: 18 },
  { level: 10, difficulty: 'medium', sequenceLength: 8, palette: THREE, reactionWindowMs: 2700, recoveryMs: 550, maxMistakes: 5, pointsPerHit: 18 },
  { level: 11, difficulty: 'medium', sequenceLength: 8, palette: THREE, reactionWindowMs: 2550, recoveryMs: 520, maxMistakes: 5, pointsPerHit: 20 },
  { level: 12, difficulty: 'medium', sequenceLength: 8, palette: THREE, reactionWindowMs: 2400, recoveryMs: 500, maxMistakes: 5, pointsPerHit: 20 },

  { level: 13, difficulty: 'hard', sequenceLength: 9, palette: THREE, reactionWindowMs: 2200, recoveryMs: 450, maxMistakes: 4, pointsPerHit: 22 },
  { level: 14, difficulty: 'hard', sequenceLength: 9, palette: THREE, reactionWindowMs: 2100, recoveryMs: 430, maxMistakes: 4, pointsPerHit: 22 },
  { level: 15, difficulty: 'hard', sequenceLength: 10, palette: THREE, reactionWindowMs: 2000, recoveryMs: 410, maxMistakes: 4, pointsPerHit: 24 },
  { level: 16, difficulty: 'hard', sequenceLength: 10, palette: THREE, reactionWindowMs: 1900, recoveryMs: 380, maxMistakes: 4, pointsPerHit: 24 },
  { level: 17, difficulty: 'hard', sequenceLength: 10, palette: THREE, reactionWindowMs: 1800, recoveryMs: 350, maxMistakes: 4, pointsPerHit: 26 },

  { level: 18, difficulty: 'expert', sequenceLength: 11, palette: THREE, reactionWindowMs: 1700, recoveryMs: 320, maxMistakes: 3, pointsPerHit: 28 },
  { level: 19, difficulty: 'expert', sequenceLength: 11, palette: THREE, reactionWindowMs: 1550, recoveryMs: 300, maxMistakes: 3, pointsPerHit: 30 },
  { level: 20, difficulty: 'expert', sequenceLength: 12, palette: THREE, reactionWindowMs: 1400, recoveryMs: 300, maxMistakes: 3, pointsPerHit: 32 },
];
