const BAR_FILL = 0.7;

export interface BarLayout {
  barWidth: number;
  step: number;
  offset: number;
}

export interface BarLayoutInput {
  count: number;
  width: number;
  maxBarWidth: number;
  minGap: number;
}

export interface ChartPoint {
  x: number;
  y: number;
}

export function niceMax(values: readonly number[]): number {
  const max = Math.max(0, ...values);

  if (max === 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(max));
  const niceSteps = [1, 2, 2.5, 5, 10];
  const step = niceSteps.find((candidate) => candidate * magnitude >= max) ?? 10;

  return step * magnitude;
}

export function barLayout({ count, width, maxBarWidth, minGap }: BarLayoutInput): BarLayout {
  if (count <= 0 || width <= 0) {
    return { barWidth: 0, step: 0, offset: 0 };
  }

  const slot = width / count;
  const minimumWidth = Math.min(1, slot);
  const barWidth = Math.max(minimumWidth, Math.min(maxBarWidth, slot - minGap, slot * BAR_FILL));

  return { barWidth, step: slot, offset: (slot - barWidth) / 2 };
}

export function barHeight(value: number, max: number, chartHeight: number): number {
  if (value <= 0 || max <= 0) {
    return 0;
  }
  return Math.max(1, (Math.min(value, max) / max) * chartHeight);
}

export function linePoints(
  values: readonly (number | null)[],
  width: number,
  height: number,
  domainMax: number,
  inset: number,
): (ChartPoint | null)[] {
  const usableWidth = Math.max(0, width - inset * 2);
  const usableHeight = Math.max(0, height - inset * 2);
  const stepX = values.length > 1 ? usableWidth / (values.length - 1) : 0;

  return values.map((value, index) => {
    if (value === null) {
      return null;
    }

    const ratio = Math.max(0, Math.min(1, value / domainMax));

    return {
      x: values.length > 1 ? inset + index * stepX : width / 2,
      y: inset + (1 - ratio) * usableHeight,
    };
  });
}

export function lineSegments(points: readonly (ChartPoint | null)[]): ChartPoint[][] {
  return points.reduce<ChartPoint[][]>(
    (segments, point) => {
      if (point === null) {
        return segments[segments.length - 1].length === 0 ? segments : [...segments, []];
      }
      const head = segments.slice(0, -1);
      return [...head, [...segments[segments.length - 1], point]];
    },
    [[]],
  ).filter((segment) => segment.length > 0);
}

export function axisLabelIndexes(count: number): number[] {
  if (count <= 0) {
    return [];
  }
  return Array.from(new Set([0, Math.floor((count - 1) / 2), count - 1]));
}
