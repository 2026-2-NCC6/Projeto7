import type { SessionSummary, TargetBreakdown } from '../api/types';

export interface PeriodMetrics {
  sessions: number;
  attempts: number;
  accuracyPercent: number | null;
  consistencyPercent: number | null;
  playTimeMs: number;
  progressionPoints: number | null;
}

function accuracyOf(session: SessionSummary): number | null {
  const attempts = session.hits + session.misses;
  return attempts > 0 ? (session.hits / attempts) * 100 : null;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function periodMetrics(sessions: SessionSummary[]): PeriodMetrics {
  const hits = sessions.reduce((sum, session) => sum + session.hits, 0);
  const attempts = sessions.reduce((sum, session) => sum + session.hits + session.misses, 0);
  const chronological = [...sessions].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  const accuracies = chronological.map(accuracyOf).filter((value): value is number => value !== null);

  const spread =
    accuracies.length > 1
      ? Math.sqrt(mean(accuracies.map((value) => (value - mean(accuracies)) ** 2)))
      : null;
  const half = Math.floor(accuracies.length / 2);
  const progression =
    accuracies.length >= 4 ? mean(accuracies.slice(half)) - mean(accuracies.slice(0, half)) : null;

  return {
    sessions: sessions.length,
    attempts,
    accuracyPercent: attempts > 0 ? (hits / attempts) * 100 : null,
    consistencyPercent: spread === null ? null : Math.max(0, 100 - spread * 2),
    playTimeMs: sessions.reduce((sum, session) => sum + session.durationMs, 0),
    progressionPoints: progression,
  };
}

export function targetsFromSession(
  targets: { targetId: number; attempts: number; correctHits: number; impactAverage: number | null; impactPeak: number | null }[],
): TargetBreakdown[] {
  return targets.map((target) => ({
    ...target,
    accuracyPercent: target.attempts > 0 ? (target.correctHits / target.attempts) * 100 : null,
  }));
}
