import { endpoints } from '../../services/api/endpoints';
import { post } from '../../services/api/httpClient';
import type { TargetMetrics } from '../domain/metrics/session-metrics';
import type { SessionResult } from '../domain/metrics/session-result';
import type {
  RecordedSession,
  RecordSessionRequest,
  TargetPerformanceRequest,
} from './types';

function toTargetPerformance({
  targetId,
  attempts,
  correctHits,
  impact,
}: TargetMetrics): TargetPerformanceRequest {
  const measured = impact && !impact.simulated ? impact : null;

  return {
    targetId,
    attempts,
    correctHits,
    impactAverage: measured?.averageRaw ?? null,
    impactPeak: measured?.maxRaw ?? null,
  };
}

export function toRecordSessionRequest({
  mode,
  level,
  cleared,
  deviceKind,
  metrics,
}: SessionResult): RecordSessionRequest {
  return {
    mode,
    level,
    cleared,
    score: Math.max(0, Math.round(metrics.finalScore)),
    hits: metrics.correctHits,
    misses: metrics.incorrectHits,
    bestStreak: metrics.longestCorrectStreak,
    durationMs: Math.round(metrics.durationMs),
    deviceKind,
    targets: metrics.perTarget.filter((target) => target.attempts > 0).map(toTargetPerformance),
    ...(metrics.response
      ? {
          avgResponseMs: Math.round(metrics.response.averageMs),
          bestResponseMs: Math.round(metrics.response.fastestMs),
        }
      : {}),
  };
}

export const sessionService = {
  record(result: SessionResult, accessToken: string): Promise<RecordedSession> {
    return post<RecordedSession>(endpoints.recordSession, toRecordSessionRequest(result), accessToken);
  },
};
