import type { IconName } from '../components/Icon';
import type { GameModeId, ProgressionTrack } from '../types/game';

export const trackLabels: Record<ProgressionTrack, string> = {
  color: 'Color',
  score: 'Score',
};

export const gameModeLabels: Record<GameModeId, string> = {
  level_color: 'Color Mode',
  level_score: 'Score Mode',
  infinite_color: 'Infinite Color',
  infinite_score: 'Infinite Score',
};

export const gameModeIcons: Record<GameModeId, IconName> = {
  level_color: 'sequence',
  level_score: 'target',
  infinite_color: 'infinite',
  infinite_score: 'timer',
};
