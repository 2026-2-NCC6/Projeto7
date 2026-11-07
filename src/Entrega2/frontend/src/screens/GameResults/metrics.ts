import { texts } from '../../content/texts';
import type { Metric } from '../../gameplay/components/MetricGrid';
import type { SessionMetrics } from '../../gameplay/domain/metrics/session-metrics';
import { hasLevels } from '../../gameplay/modes/mode-catalog';
import type { PlayableModeId } from '../../types/game';

const UNAVAILABLE = '—';
const MS_PER_SECOND = 1000;

function duration(milliseconds: number): string {
  const totalSeconds = Math.round(milliseconds / MS_PER_SECOND);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function seconds(milliseconds: number): string {
  return `${(milliseconds / MS_PER_SECOND).toFixed(2)}s`;
}

function percent(value: number | null): string {
  return value === null ? UNAVAILABLE : `${Math.round(value)}%`;
}

const responseLabels: Record<PlayableModeId, { average: string; fastest: string }> = {
  level_color: {
    average: texts.results.averageResponse,
    fastest: texts.results.fastestResponse,
  },
  level_score: {
    average: texts.results.averageInterval,
    fastest: texts.results.fastestInterval,
  },
  infinite_color: {
    average: texts.results.averageResponse,
    fastest: texts.results.fastestResponse,
  },
  infinite_score: {
    average: texts.results.averageInterval,
    fastest: texts.results.fastestInterval,
  },
};

export function metricsFor(mode: PlayableModeId, metrics: SessionMetrics): Metric[] {
  const labels = responseLabels[mode];
  // Impacto só é confiável quando vem da parede; com o simulador fica indisponível.
  const impact =
    metrics.impact && !metrics.impact.simulated ? String(metrics.impact.averageRaw) : UNAVAILABLE;

  return [
    { key: 'duration', label: texts.results.duration, value: duration(metrics.durationMs) },
    { key: 'accuracy', label: texts.results.accuracy, value: percent(metrics.accuracyPercent) },
    { key: 'score', label: texts.results.finalScore, value: String(metrics.finalScore) },
    {
      key: 'streak',
      label: texts.results.longestStreak,
      value: String(metrics.longestCorrectStreak),
    },
    {
      key: 'averageResponse',
      label: labels.average,
      value: metrics.response ? seconds(metrics.response.averageMs) : UNAVAILABLE,
    },
    {
      key: 'fastestResponse',
      label: labels.fastest,
      value: metrics.response ? seconds(metrics.response.fastestMs) : UNAVAILABLE,
    },
    { key: 'attempts', label: texts.results.attempts, value: String(metrics.totalAttempts) },
    // Completion is a share of a level, so an endless run has none.
    ...(hasLevels(mode)
      ? [
          {
            key: 'completion',
            label: texts.results.completion,
            value: `${metrics.completionPercent}%`,
          },
        ]
      : []),
    { key: 'impact', label: texts.results.impact, value: impact },
  ];
}
