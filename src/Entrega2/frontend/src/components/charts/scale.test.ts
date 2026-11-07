import {
  axisLabelIndexes,
  barHeight,
  barLayout,
  linePoints,
  lineSegments,
  niceMax,
} from './scale';

describe('niceMax', () => {
  it('never returns zero, so an all-zero series still has a scale', () => {
    expect(niceMax([])).toBe(1);
    expect(niceMax([0, 0, 0])).toBe(1);
  });

  it('rounds the maximum up to a readable step', () => {
    expect(niceMax([3])).toBe(5);
    expect(niceMax([7, 12])).toBe(20);
    expect(niceMax([230])).toBe(250);
    expect(niceMax([1_000_000])).toBe(1_000_000);
    expect(niceMax([1_000_001])).toBe(2_000_000);
  });
});

describe('barLayout', () => {
  const base = { width: 300, maxBarWidth: 22, minGap: 2 };

  it.each([1, 7, 30, 365])('keeps %i bars inside the chart width', (count) => {
    const layout = barLayout({ ...base, count });
    const lastBarEnd = (count - 1) * layout.step + layout.offset + layout.barWidth;

    expect(layout.barWidth).toBeGreaterThan(0);
    expect(layout.barWidth).toBeLessThanOrEqual(base.maxBarWidth);
    expect(lastBarEnd).toBeLessThanOrEqual(base.width + 1e-9);
  });

  it('keeps a single bar centered and capped', () => {
    expect(barLayout({ ...base, count: 1 })).toEqual({ barWidth: 22, step: 300, offset: 139 });
  });

  it('draws nothing before the chart has been measured', () => {
    expect(barLayout({ ...base, count: 7, width: 0 })).toEqual({ barWidth: 0, step: 0, offset: 0 });
  });
});

describe('barHeight', () => {
  it('scales against the maximum and clamps overflowing values', () => {
    expect(barHeight(0, 10, 100)).toBe(0);
    expect(barHeight(5, 10, 100)).toBe(50);
    expect(barHeight(50, 10, 100)).toBe(100);
    expect(barHeight(0.001, 10_000, 100)).toBe(1);
  });
});

describe('linePoints', () => {
  it('centers a single point', () => {
    expect(linePoints([50], 200, 100, 100, 10)).toEqual([{ x: 100, y: 50 }]);
  });

  it('keeps every point inside the plot, even out-of-domain values', () => {
    const points = linePoints([-20, 0, 100, 180, null], 200, 100, 100, 10);

    points.forEach((point) => {
      if (point) {
        expect(point.x).toBeGreaterThanOrEqual(10);
        expect(point.x).toBeLessThanOrEqual(190);
        expect(point.y).toBeGreaterThanOrEqual(10);
        expect(point.y).toBeLessThanOrEqual(90);
      }
    });
    expect(points[4]).toBeNull();
  });
});

describe('lineSegments', () => {
  it('breaks the line where a session had no attempts', () => {
    const segments = lineSegments([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      null,
      null,
      { x: 4, y: 4 },
    ]);

    expect(segments).toEqual([
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [{ x: 4, y: 4 }],
    ]);
  });

  it('returns nothing for an all-empty series', () => {
    expect(lineSegments([null, null])).toEqual([]);
  });
});

describe('axisLabelIndexes', () => {
  it('labels first, middle and last without duplicates', () => {
    expect(axisLabelIndexes(0)).toEqual([]);
    expect(axisLabelIndexes(1)).toEqual([0]);
    expect(axisLabelIndexes(2)).toEqual([0, 1]);
    expect(axisLabelIndexes(30)).toEqual([0, 14, 29]);
  });
});
