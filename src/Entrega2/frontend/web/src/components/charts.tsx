import { WALL_TARGETS } from '@app/device/contracts/target';
import { colorLabels } from '../content/labels';
import { formatDay, formatNumber, formatPercent } from '../content/format';
import type { DailyActivity, TargetBreakdown } from '../api/types';

const WIDTH = 640;
const HEIGHT = 180;
const PADDING = 28;

function niceMax(values: number[]): number {
  const max = Math.max(1, ...values);
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
}

export function ActivityChart({ activity }: { activity: DailyActivity[] }) {
  const max = niceMax(activity.map((day) => day.sessions));
  const slot = (WIDTH - PADDING * 2) / Math.max(1, activity.length);
  const barWidth = Math.max(4, slot * 0.6);
  const accuracyPoints = activity
    .map((day, index) =>
      day.accuracyPercent === null
        ? null
        : `${PADDING + index * slot + slot / 2},${HEIGHT - PADDING - (day.accuracyPercent / 100) * (HEIGHT - PADDING * 2)}`,
    )
    .filter((point): point is string => point !== null);
  const total = activity.reduce((sum, day) => sum + day.sessions, 0);
  const labelEvery = Math.ceil(activity.length / 6);

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${total} sessões no período`}>
        {[0, 0.5, 1].map((fraction) => {
          const y = HEIGHT - PADDING - fraction * (HEIGHT - PADDING * 2);
          return (
            <g key={fraction}>
              <line x1={PADDING} x2={WIDTH - PADDING} y1={y} y2={y} className="chart-grid" />
              <text x={PADDING - 6} y={y + 4} textAnchor="end" className="chart-label">
                {Math.round(max * fraction)}
              </text>
            </g>
          );
        })}
        {activity.map((day, index) => {
          const height = (day.sessions / max) * (HEIGHT - PADDING * 2);
          const x = PADDING + index * slot + (slot - barWidth) / 2;
          return (
            <g key={day.day}>
              <rect x={x} y={HEIGHT - PADDING - height} width={barWidth} height={height} rx={3} className="chart-bar">
                <title>{`${formatDay(day.day)}: ${day.sessions} sessões, precisão ${formatPercent(day.accuracyPercent)}`}</title>
              </rect>
              {index % labelEvery === 0 ? (
                <text x={x + barWidth / 2} y={HEIGHT - 8} textAnchor="middle" className="chart-label">
                  {formatDay(day.day)}
                </text>
              ) : null}
            </g>
          );
        })}
        {accuracyPoints.length > 1 ? <polyline points={accuracyPoints.join(' ')} className="chart-line" /> : null}
      </svg>
      <figcaption className="row small muted">
        <span className="legend legend-bar">Sessões por dia</span>
        <span className="legend legend-line">Precisão do dia (0–100%)</span>
      </figcaption>
    </figure>
  );
}

function heatOf(accuracy: number | null): string {
  if (accuracy === null) {
    return 'var(--surface)';
  }

  const alpha = 0.15 + (accuracy / 100) * 0.75;
  return `rgba(143, 212, 0, ${alpha.toFixed(2)})`;
}

export function WallMap({ targets }: { targets: TargetBreakdown[] }) {
  return (
    <div className="wall-map" role="table" aria-label="Precisão por alvo da parede">
      {WALL_TARGETS.map((target) => {
        const stats = targets.find((entry) => entry.targetId === target.id);
        return (
          <div
            key={target.id}
            className="wall-cell"
            role="cell"
            style={{ background: heatOf(stats?.accuracyPercent ?? null) }}
          >
            <div className="row-between">
              <strong>A{target.id}</strong>
              <span className={`color-dot ${target.color}`} title={colorLabels[target.color]} />
            </div>
            <span className="wall-value">{formatPercent(stats?.accuracyPercent)}</span>
            <span className="small muted">
              {formatNumber(stats?.correctHits ?? 0)}/{formatNumber(stats?.attempts ?? 0)} acertos
            </span>
            {stats?.impactAverage !== null && stats?.impactAverage !== undefined ? (
              <span className="small muted">Impacto médio {formatNumber(stats.impactAverage)}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
