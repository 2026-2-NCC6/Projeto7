import type { GameModeId, PlayableModeId } from '../../types/game';

export type ModeAccent = 'primary' | 'blue' | 'red' | 'ink';

export interface ModeCatalogEntry {
  readonly id: GameModeId;
  readonly accent: ModeAccent;
  readonly badge: string;
  readonly playable: boolean;
}

export const modeCatalog: readonly ModeCatalogEntry[] = [
  { id: 'level_color', accent: 'primary', badge: '01', playable: true },
  { id: 'level_score', accent: 'blue', badge: '02', playable: true },
  { id: 'infinite_color', accent: 'red', badge: '03', playable: false },
  { id: 'infinite_score', accent: 'ink', badge: '04', playable: false },
];

export function isPlayable(entry: ModeCatalogEntry): entry is ModeCatalogEntry & {
  id: PlayableModeId;
} {
  return entry.playable;
}
