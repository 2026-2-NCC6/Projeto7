import { WALL_TARGETS } from '../../../device/contracts';
import type { AttemptRecord } from './attempt-record';
import type {
  ImpactMetrics,
  ResponseMetrics,
  SessionMetrics,
  TargetMetrics,
} from './session-metrics';

const PERCENT = 100;

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function impactMetricsOf(records: readonly AttemptRecord[]): ImpactMetrics | null {
  const readings = records.map((record) => record.impact).filter((impact) => impact !== null);

  if (readings.length === 0) {
    return null;
  }

  const raws = readings.map((reading) => reading.raw);
  const averageRaw = average(raws);
  const spread = Math.sqrt(average(raws.map((raw) => (raw - averageRaw) ** 2)));

  return {
    averageRaw: Math.round(averageRaw),
    maxRaw: Math.max(...raws),
    minRaw: Math.min(...raws),
    consistencyPercent:
      averageRaw === 0 ? 0 : Math.max(0, Math.round((1 - spread / averageRaw) * PERCENT)),
    simulated: readings.some((reading) => reading.simulated),
  };
}

function responseMetricsOf(records: readonly AttemptRecord[]): ResponseMetrics | null {
  if (records.length === 0) {
    return null;
  }

  const times = records.map((record) => record.responseMs);

  return {
    averageMs: Math.round(average(times)),
    fastestMs: Math.min(...times),
    slowestMs: Math.max(...times),
  };
}

function perTargetMetricsOf(records: readonly AttemptRecord[]): TargetMetrics[] {
  return WALL_TARGETS.map((target) => {
    const attempts = records.filter((record) => record.targetId === target.id);

    return {
      targetId: target.id,
      color: target.color,
      attempts: attempts.length,
      correctHits: attempts.filter((record) => record.verdict === 'correct').length,
      impact: impactMetricsOf(attempts),
    };
  });
}

function longestCorrectStreakOf(records: readonly AttemptRecord[]): number {
  let longest = 0;
  let current = 0;

  records.forEach((record) => {
    current = record.verdict === 'correct' ? current + 1 : 0;
    longest = Math.max(longest, current);
  });

  return longest;
}

export interface MetricsInput {
  readonly level: number;
  readonly durationMs: number;
  readonly finalScore: number;
  readonly progress: number;
  readonly cleared: boolean;
  readonly records: readonly AttemptRecord[];
}

export function collectSessionMetrics(input: MetricsInput): SessionMetrics {
  const { records } = input;
  const correctHits = records.filter((record) => record.verdict === 'correct').length;

  return {
    level: input.level,
    durationMs: input.durationMs,
    totalAttempts: records.length,
    correctHits,
    incorrectHits: records.length - correctHits,
    accuracyPercent: records.length === 0 ? null : (correctHits / records.length) * PERCENT,
    longestCorrectStreak: longestCorrectStreakOf(records),
    finalScore: input.finalScore,
    completionPercent: input.cleared ? PERCENT : Math.round(input.progress * PERCENT),
    response: responseMetricsOf(records),
    perTarget: perTargetMetricsOf(records),
    impact: impactMetricsOf(records),
  };
}
