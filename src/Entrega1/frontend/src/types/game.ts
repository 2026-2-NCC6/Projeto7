export type ProgressionTrack = 'color' | 'score';

export type GameModeId = 'level_color' | 'level_score' | 'infinite_color' | 'infinite_score';

/** Every mode with rules behind it. */
export type PlayableModeId = GameModeId;

/** The modes that have a level table — the only ones level select can show. */
export type LevelModeId = Extract<GameModeId, 'level_color' | 'level_score'>;

export const PLAYABLE_MODES: PlayableModeId[] = [
  'level_color',
  'level_score',
  'infinite_color',
  'infinite_score',
];

export const TARGET_COLORS = ['amber', 'blue', 'red'] as const;

export type TargetColor = (typeof TARGET_COLORS)[number];
