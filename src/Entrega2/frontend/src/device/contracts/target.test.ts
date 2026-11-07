import { TARGET_IDS, WALL_TARGETS, wallTarget } from './target';

describe('WALL_TARGETS', () => {
  it('models the 3×2 wall: A1..A3 on top, A4..A6 below', () => {
    expect(TARGET_IDS).toEqual([1, 2, 3, 4, 5, 6]);
    expect(WALL_TARGETS.map(({ id, row, column }) => [id, row, column])).toEqual([
      [1, 1, 1], [2, 1, 2], [3, 1, 3],
      [4, 2, 1], [5, 2, 2], [6, 2, 3],
    ]);
  });

  it('puts each colour once per row and never twice in a column', () => {
    for (const row of [1, 2]) {
      const colours = WALL_TARGETS.filter((target) => target.row === row).map((target) => target.color);
      expect(new Set(colours).size).toBe(3);
    }

    for (const column of [1, 2, 3]) {
      const colours = WALL_TARGETS.filter((target) => target.column === column).map((target) => target.color);
      expect(new Set(colours).size).toBe(2);
    }
  });

  it('knows no target beyond A6', () => {
    expect(wallTarget(6)).not.toBeNull();
    expect(wallTarget(7)).toBeNull();
  });
});
