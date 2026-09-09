import { endpoints } from '../../services/api/endpoints';
import { post } from '../../services/api/httpClient';
import type { SessionResult } from '../domain/metrics/session-result';
import type { RecordedSession, RecordSessionRequest } from './types';

function toRecordSessionRequest({
  mode,
  level,
  cleared,
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
