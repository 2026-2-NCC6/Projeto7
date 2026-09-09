export type ProgressionTrack = 'color' | 'score';

export type GameModeId = 'level_color' | 'level_score' | 'infinite_color' | 'infinite_score';

export type PlayableModeId = Extract<GameModeId, 'level_color' | 'level_score'>;

export const PLAYABLE_MODES: PlayableModeId[] = ['level_color', 'level_score'];

export const TARGET_COLORS = ['amber', 'blue', 'red'] as const;

export type TargetColor = (typeof TARGET_COLORS)[number];
