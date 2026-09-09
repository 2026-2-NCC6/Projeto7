import type { TargetColor } from '../../types/game';

export const TARGET_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type TargetId = (typeof TARGET_IDS)[number];

export type GridIndex = 1 | 2 | 3;

export interface WallTarget {
  id: TargetId;
  row: GridIndex;
  column: GridIndex;
  color: TargetColor;
}

const COLOR_BY_POSITION: TargetColor[] = [
  'amber', 'blue', 'red',
  'blue', 'red', 'amber',
  'red', 'amber', 'blue',
];

export const WALL_TARGETS: readonly WallTarget[] = TARGET_IDS.map((id, index) => ({
  id,
  row: (Math.floor(index / 3) + 1) as GridIndex,
  column: ((index % 3) + 1) as GridIndex,
  color: COLOR_BY_POSITION[index],
}));

const byId = new Map<number, WallTarget>(WALL_TARGETS.map((target) => [target.id, target]));

export function wallTarget(id: number): WallTarget | null {
  return byId.get(id) ?? null;
}

export function targetsWithColor(color: TargetColor): WallTarget[] {
  return WALL_TARGETS.filter((target) => target.color === color);
}
