import { texts } from '../../content/texts';
import { endpoints } from '../../services/api/endpoints';
import { ApiError, post } from '../../services/api/httpClient';
import type { AttemptRecord } from '../domain/metrics/attempt-record';
import type { TargetMetrics } from '../domain/metrics/session-metrics';
import type { SessionResult } from '../domain/metrics/session-result';
import { clientSessionId } from '../outbox/client-id';
import { isNetworkError } from '../outbox/flushOutbox';
import { useOutboxStore } from '../outbox/outboxStore';
import type {
  AttemptRequest,
  EndReason,
  RecordedSession,
  RecordSessionRequest,
  SessionResultRequest,
  StartedSession,
  StartSessionRequest,
  TargetPerformanceRequest,
} from './types';

const MAX_ATTEMPTS = 2000;

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

function toAttempt(record: AttemptRecord): AttemptRequest {
  return {
    atMs: Math.round(record.atMs),
    responseMs: Math.round(record.responseMs),
    verdict: record.verdict,
    targetId: record.targetId,
    scoreDelta: Math.round(record.scoreDelta),
    intensity: record.impact && !record.impact.simulated ? Math.round(record.impact.raw) : null,
  };
}

function endReasonOf({ cleared, failureReason }: SessionResult): EndReason | undefined {
  return cleared ? 'cleared' : (failureReason ?? undefined);
}

export function toSessionResultRequest(result: SessionResult): SessionResultRequest {
  const { mode, level, cleared, deviceKind, metrics } = result;

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
    ...(result.training ? { training: result.training } : {}),
    ...(endReasonOf(result) ? { endReason: endReasonOf(result) } : {}),
    ...(result.stopReason ? { stopReason: result.stopReason } : {}),
    interruptions: result.interruptions,
    ...(result.deviceId ? { deviceId: result.deviceId } : {}),
    attempts: result.records.slice(0, MAX_ATTEMPTS).map(toAttempt),
  };
}

export function toRecordSessionRequest(result: SessionResult, ticket: string): RecordSessionRequest {
  return { ticket, ...toSessionResultRequest(result) };
}

export type RecordOutcome =
  | { readonly kind: 'saved'; readonly recorded: RecordedSession }
  | { readonly kind: 'queued' };

const openTickets = new Map<number, Promise<string>>();

function queue(result: SessionResult, ticket: string | null): RecordOutcome {
  useOutboxStore.getState().enqueue({
    clientSessionId: clientSessionId(),
    ticket,
    playedAt: new Date(result.endedAt).toISOString(),
    request: toSessionResultRequest(result),
  });
  return { kind: 'queued' };
}

export const sessionService = {
  open(request: StartSessionRequest, startedAt: number, accessToken: string): void {
    const ticket = post<StartedSession>(endpoints.startSession, request, accessToken).then(
      (started) => started.ticket,
    );

    ticket.catch(() => undefined);
    openTickets.clear();
    openTickets.set(startedAt, ticket);
  },

  async record(result: SessionResult, accessToken: string): Promise<RecordOutcome> {
    const pending = openTickets.get(result.startedAt);

    if (!pending) {
      throw new ApiError(texts.results.sessionNotOpened, 0);
    }

    let ticket: string;

    try {
      ticket = await pending;
    } catch (error) {
      if (isNetworkError(error)) {
        return queue(result, null);
      }
      throw error;
    }

    try {
      const recorded = await post<RecordedSession>(
        endpoints.recordSession,
        toRecordSessionRequest(result, ticket),
        accessToken,
      );
      return { kind: 'saved', recorded };
    } catch (error) {
      if (isNetworkError(error)) {
        return queue(result, ticket);
      }
      throw error;
    }
  },
};
