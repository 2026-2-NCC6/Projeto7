import { texts } from '../../content/texts';
import { endpoints } from '../../services/api/endpoints';
import { ApiError, post } from '../../services/api/httpClient';
import type { TargetMetrics } from '../domain/metrics/session-metrics';
import type { SessionResult } from '../domain/metrics/session-result';
import type {
  RecordedSession,
  RecordSessionRequest,
  StartedSession,
  StartSessionRequest,
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

export function toRecordSessionRequest(
  { mode, level, cleared, deviceKind, metrics }: SessionResult,
  ticket: string,
): RecordSessionRequest {
  return {
    ticket,
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

/**
 * The ticket of the session being played, keyed by when it started. Only one
 * session runs at a time, so opening a new one forgets the previous ticket.
 */
const openTickets = new Map<number, Promise<string>>();

export const sessionService = {
  /** Opens the session on the server as play starts, without holding the game up. */
  open(request: StartSessionRequest, startedAt: number, accessToken: string): void {
    const ticket = post<StartedSession>(endpoints.startSession, request, accessToken).then(
      (started) => started.ticket,
    );

    // A failure surfaces when the result is recorded, not as an unhandled rejection now.
    ticket.catch(() => undefined);
    openTickets.clear();
    openTickets.set(startedAt, ticket);
  },

  async record(result: SessionResult, accessToken: string): Promise<RecordedSession> {
    const ticket = openTickets.get(result.startedAt);

    if (!ticket) {
      throw new ApiError(texts.results.sessionNotOpened, 0);
    }

    return post<RecordedSession>(
      endpoints.recordSession,
      toRecordSessionRequest(result, await ticket),
      accessToken,
    );
  },
};
