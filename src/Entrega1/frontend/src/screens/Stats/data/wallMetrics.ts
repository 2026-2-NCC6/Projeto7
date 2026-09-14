import { IMPACT_MAX_RAW, WALL_TARGETS, type WallTarget } from '../../../device/contracts';
import { formatNumber, formatPercent } from '../../../content/formatters';
import { texts } from '../../../content/texts';
import type { TargetBreakdown } from '../../../services/statistics/types';
import { TARGET_COLORS, type TargetColor } from '../../../types/game';

const PERCENT = 100;

export interface WallCell {
  target: WallTarget;
  intensity: number;
  label: string;
}

export interface ColorAccuracy {
  color: TargetColor;
  label: string;
  percent: number | null;
  valueLabel: string;
}

export interface ImpactRow {
  target: WallTarget;
  label: string;
  averagePercent: number;
  valueLabel: string;
}

function breakdownOf(targets: readonly TargetBreakdown[], targetId: number): TargetBreakdown | null {
  return targets.find((breakdown) => breakdown.targetId === targetId) ?? null;
}

export function hasTargetData(targets: readonly TargetBreakdown[]): boolean {
  return targets.some((breakdown) => breakdown.attempts > 0);
}

export function wallCells(targets: readonly TargetBreakdown[]): WallCell[] {
  const totalHits = targets.reduce((total, breakdown) => total + breakdown.correctHits, 0);
  const shares = WALL_TARGETS.map((target) =>
    totalHits > 0 ? (breakdownOf(targets, target.id)?.correctHits ?? 0) / totalHits : 0,
  );
  const topShare = Math.max(0, ...shares);

  return WALL_TARGETS.map((target, index) => ({
    target,
    intensity: topShare > 0 ? shares[index] / topShare : 0,
    label: formatPercent(shares[index] * PERCENT),
  }));
}

export function colorAccuracy(targets: readonly TargetBreakdown[]): ColorAccuracy[] {
  return TARGET_COLORS.map((color) => {
    const ofColor = WALL_TARGETS.filter((target) => target.color === color).map((target) =>
      breakdownOf(targets, target.id),
    );
    const attempts = ofColor.reduce((total, breakdown) => total + (breakdown?.attempts ?? 0), 0);
    const hits = ofColor.reduce((total, breakdown) => total + (breakdown?.correctHits ?? 0), 0);
    const percent = attempts > 0 ? (hits / attempts) * PERCENT : null;

    return {
      color,
      label: texts.stats.colors[color],
      percent,
      valueLabel: percent === null ? texts.stats.empty : formatPercent(percent),
    };
  });
}

export function impactRows(targets: readonly TargetBreakdown[]): ImpactRow[] {
  return WALL_TARGETS.flatMap((target) => {
    const breakdown = breakdownOf(targets, target.id);

    if (breakdown?.impactAverage === null || breakdown?.impactAverage === undefined) {
      return [];
    }

    const peak = breakdown.impactPeak ?? breakdown.impactAverage;

    return [
      {
        target,
        label: texts.stats.target(target.id),
        averagePercent: (breakdown.impactAverage / IMPACT_MAX_RAW) * PERCENT,
        valueLabel: `${texts.stats.impactAverage} ${formatNumber(breakdown.impactAverage)} · ${texts.stats.impactPeak} ${formatNumber(peak)}`,
      },
    ];
  });
}
