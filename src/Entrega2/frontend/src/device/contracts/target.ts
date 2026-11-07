import type { TargetColor } from '../../types/game';

/** The wall seen from the front: A1..A3 on the top row, A4..A6 below. */
export const TARGET_IDS = [1, 2, 3, 4, 5, 6] as const;

export type TargetId = (typeof TARGET_IDS)[number];

export const WALL_ROWS = [1, 2] as const;
export const WALL_COLUMNS = [1, 2, 3] as const;

export type RowIndex = (typeof WALL_ROWS)[number];
export type ColumnIndex = (typeof WALL_COLUMNS)[number];

export interface WallTarget {
  id: TargetId;
  row: RowIndex;
  column: ColumnIndex;
  color: TargetColor;
}

const COLOR_BY_POSITION: TargetColor[] = [
  'amber', 'blue', 'red',
  'red', 'amber', 'blue',
];

export const WALL_TARGETS: readonly WallTarget[] = TARGET_IDS.map((id, index) => ({
  id,
  row: (Math.floor(index / WALL_COLUMNS.length) + 1) as RowIndex,
  column: ((index % WALL_COLUMNS.length) + 1) as ColumnIndex,
  color: COLOR_BY_POSITION[index],
}));

const byId = new Map<number, WallTarget>(WALL_TARGETS.map((target) => [target.id, target]));

export function wallTarget(id: number): WallTarget | null {
  return byId.get(id) ?? null;
}

export function targetsWithColor(color: TargetColor): WallTarget[] {
  return WALL_TARGETS.filter((target) => target.color === color);
}
