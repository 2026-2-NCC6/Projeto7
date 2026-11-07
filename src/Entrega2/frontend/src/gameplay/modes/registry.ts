import type { LevelModeId, PlayableModeId } from '../../types/game';
import type { GameRules, LevelConfig } from '../domain/game-rules';
import { colorRules } from './color/color-rules';
import { infiniteColorRules } from './infinite-color/infinite-color-rules';
import { infiniteScoreRules } from './infinite-score/infinite-score-rules';
import { scoreRules } from './score/score-rules';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRules = GameRules<LevelConfig, any>;

const registry: Record<PlayableModeId, AnyRules> = {
  level_color: colorRules,
  level_score: scoreRules,
  infinite_color: infiniteColorRules,
  infinite_score: infiniteScoreRules,
};

export function rulesFor(mode: PlayableModeId): AnyRules {
  return registry[mode];
}

export function levelCountOf(mode: LevelModeId): number {
  return registry[mode].levels.length;
}
