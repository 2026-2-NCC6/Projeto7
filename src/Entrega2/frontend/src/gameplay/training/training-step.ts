import type { TargetColor } from '../../types/game';
import type { DifficultyBand } from '../domain/game-rules';
import type { ColorLevelConfig } from '../modes/color/color-levels';
import { INFINITE_LEVEL } from '../modes/mode-catalog';
import type { ScoreLevelConfig } from '../modes/score/score-levels';
import type { StreakMultiplier } from '../modes/shared/scoring';

export type TrainingDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ColorStepConfig {
  readonly sequenceLength: number;
  readonly palette: readonly TargetColor[];
  readonly reactionWindowMs: number | null;
  readonly maxMistakes: number | null;
  readonly pointsPerHit: number;
  readonly recoveryMs: number;
}

export interface ScoreStepConfig {
  readonly targetScore: number;
  readonly timeLimitMs: number | null;
  readonly pointsPerColor: Record<TargetColor, number>;
  readonly palette: readonly TargetColor[];
  readonly streakMultiplier: StreakMultiplier | null;
  readonly missPenalty: number;
  readonly requiredAccuracyPercent: number | null;
  readonly recoveryMs: number;
}

export type TrainingStep =
  | { readonly title: string; readonly mode: 'level_color'; readonly config: ColorStepConfig }
  | { readonly title: string; readonly mode: 'level_score'; readonly config: ScoreStepConfig };

export type TrainingStepMode = TrainingStep['mode'];

export const TRAINING_STEP_LEVEL = INFINITE_LEVEL;

const BAND_BY_DIFFICULTY: Record<TrainingDifficulty, DifficultyBand> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
};

export function colorLevelConfigOf(
  config: ColorStepConfig,
  difficulty: TrainingDifficulty,
): ColorLevelConfig {
  return { ...config, level: TRAINING_STEP_LEVEL, difficulty: BAND_BY_DIFFICULTY[difficulty] };
}

export function scoreLevelConfigOf(
  config: ScoreStepConfig,
  difficulty: TrainingDifficulty,
): ScoreLevelConfig {
  return { ...config, level: TRAINING_STEP_LEVEL, difficulty: BAND_BY_DIFFICULTY[difficulty] };
}

export function levelConfigOf(
  step: TrainingStep,
  difficulty: TrainingDifficulty,
): ColorLevelConfig | ScoreLevelConfig {
  return step.mode === 'level_color'
    ? colorLevelConfigOf(step.config, difficulty)
    : scoreLevelConfigOf(step.config, difficulty);
}
