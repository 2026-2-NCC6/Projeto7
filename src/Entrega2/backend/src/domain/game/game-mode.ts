export const PROGRESSION_TRACKS = ['color', 'score'] as const;

export type ProgressionTrack = (typeof PROGRESSION_TRACKS)[number];

export const GAME_MODES = [
  'level_color',
  'level_score',
  'infinite_color',
  'infinite_score',
] as const;

export type GameMode = (typeof GAME_MODES)[number];

export const LEVEL_MODES: GameMode[] = ['level_color', 'level_score'];

export const INFINITE_MODES: GameMode[] = ['infinite_color', 'infinite_score'];

export function isInfiniteMode(mode: GameMode): boolean {
  return INFINITE_MODES.includes(mode);
}
