import type { GameModeId, LevelModeId, PlayableModeId } from '../../types/game';

export type ModeAccent = 'primary' | 'blue' | 'red' | 'ink';

/** The level a run reports when its mode has no level table. */
export const INFINITE_LEVEL = 0;

export interface ModeCatalogEntry {
  readonly id: GameModeId;
  readonly accent: ModeAccent;
  readonly badge: string;
  readonly playable: boolean;
  /** Endless modes have a single configuration, so there is nothing to select. */
  readonly hasLevels: boolean;
}

export const modeCatalog: readonly ModeCatalogEntry[] = [
  { id: 'level_color', accent: 'primary', badge: '01', playable: true, hasLevels: true },
  { id: 'level_score', accent: 'blue', badge: '02', playable: true, hasLevels: true },
  { id: 'infinite_color', accent: 'red', badge: '03', playable: true, hasLevels: false },
  { id: 'infinite_score', accent: 'ink', badge: '04', playable: true, hasLevels: false },
];

export function isPlayable(entry: ModeCatalogEntry): entry is ModeCatalogEntry & {
  id: PlayableModeId;
} {
  return entry.playable;
}

export function hasLevels(mode: GameModeId): mode is LevelModeId {
  return modeCatalog.some((entry) => entry.id === mode && entry.hasLevels);
}
