import { GameMode, ProgressionTrack } from './game-mode';

export const TRACK_BY_MODE: Record<GameMode, ProgressionTrack> = {
  level_color: 'color',
  level_score: 'score',
  infinite_color: 'color',
  infinite_score: 'score',
};
