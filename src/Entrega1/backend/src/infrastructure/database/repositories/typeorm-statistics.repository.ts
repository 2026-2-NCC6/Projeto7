import { DataSource } from 'typeorm';
import { GameMode } from '../../../domain/game/game-mode';
import { accuracyOf } from '../../../domain/statistics/statistics-rules';
import { StatisticsRepository } from '../../../domain/statistics/statistics-repository.port';
import { StatisticsScope } from '../../../domain/statistics/statistics-scope';
import {
  ActivitySummary,
  DailyActivity,
  ModeBreakdown,
  RecentSession,
  TargetBreakdown,
} from '../../../domain/statistics/training-statistics';
import { DeviceKind } from '../../../domain/training-session/device-kind';

type Numeric = string | number | null;

interface SummaryRow {
  sessions: Numeric;
  play_time_ms: Numeric;
  hits: Numeric;
  misses: Numeric;
  average_response_ms: Numeric;
  best_response_ms: Numeric;
  xp_earned: Numeric;
  total_score: Numeric;
  best_score: Numeric;
  longest_hit_streak: Numeric;
  hardware_sessions: Numeric;
  first_played_at: Date | null;
  last_played_at: Date | null;
}

interface ModeRow {
  mode: GameMode;
  sessions: Numeric;
  play_time_ms: Numeric;
  hits: Numeric;
  attempts: Numeric;
  best_score: Numeric;
  highest_cleared: Numeric;
}

interface DailyRow {
  day: string;
  sessions: Numeric;
  score: Numeric;
  hits: Numeric;
  attempts: Numeric;
}

interface TargetRow {
  target_id: Numeric;
  attempts: Numeric;
  correct_hits: Numeric;
  impact_average: Numeric;
  impact_peak: Numeric;
}

interface RecentRow {
  id: string;
  mode: GameMode;
  level: number;
  cleared: boolean;
  score: number;
  hits: number;
  misses: number;
  duration_ms: number;
  device_kind: DeviceKind;
  played_at: Date;
}

interface ScopedQuery {
  filter: string;
  params: unknown[];
}

function scoped(scope: StatisticsScope): ScopedQuery {
  return scope.kind === 'player'
    ? { filter: 'session.user_id = $1', params: [scope.userId] }
    : { filter: 'TRUE', params: [] };
}

function toNumber(value: Numeric): number {
  return Number(value ?? 0);
}

function toNullableNumber(value: Numeric): number | null {
  return value === null ? null : Number(value);
}

export class TypeOrmStatisticsRepository implements StatisticsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async summaryFor(scope: StatisticsScope): Promise<ActivitySummary> {
    const { filter, params } = scoped(scope);
    const [row] = await this.dataSource.query<SummaryRow[]>(
      `SELECT
         COUNT(*) AS sessions,
         SUM(session.duration_ms) AS play_time_ms,
         SUM(session.hits) AS hits,
         SUM(session.misses) AS misses,
         ROUND(
           SUM(session.avg_response_ms::bigint * (session.hits + session.misses))
             FILTER (WHERE session.avg_response_ms IS NOT NULL)::numeric
           / NULLIF(SUM(session.hits + session.misses)
             FILTER (WHERE session.avg_response_ms IS NOT NULL), 0)
         ) AS average_response_ms,
         MIN(session.best_response_ms) AS best_response_ms,
         SUM(session.xp_awarded) AS xp_earned,
         SUM(session.score) AS total_score,
         MAX(session.score) AS best_score,
         MAX(session.best_streak) AS longest_hit_streak,
         COUNT(*) FILTER (WHERE session.device_kind = 'websocket') AS hardware_sessions,
         MIN(session.played_at) AS first_played_at,
         MAX(session.played_at) AS last_played_at
       FROM training_sessions session
       WHERE ${filter}`,
      params,
    );

    const hits = toNumber(row.hits);
    const misses = toNumber(row.misses);

    return {
      sessions: toNumber(row.sessions),
      playTimeMs: toNumber(row.play_time_ms),
      hits,
      misses,
      accuracyPercent: accuracyOf(hits, hits + misses),
      averageResponseMs: toNullableNumber(row.average_response_ms),
      bestResponseMs: toNullableNumber(row.best_response_ms),
      xpEarned: toNumber(row.xp_earned),
      totalScore: toNumber(row.total_score),
      bestScore: toNullableNumber(row.best_score),
      longestHitStreak: toNumber(row.longest_hit_streak),
      hardwareSessions: toNumber(row.hardware_sessions),
      firstPlayedAt: row.first_played_at,
      lastPlayedAt: row.last_played_at,
    };
  }

  async modesFor(scope: StatisticsScope): Promise<ModeBreakdown[]> {
    const { filter, params } = scoped(scope);
    const rows = await this.dataSource.query<ModeRow[]>(
      `SELECT
         session.mode,
         COUNT(*) AS sessions,
         SUM(session.duration_ms) AS play_time_ms,
         SUM(session.hits) AS hits,
         SUM(session.hits + session.misses) AS attempts,
         MAX(session.score) AS best_score,
         COALESCE(MAX(session.level) FILTER (WHERE session.cleared), 0) AS highest_cleared
       FROM training_sessions session
       WHERE ${filter}
       GROUP BY session.mode`,
      params,
    );

    return rows.map((row) => ({
      mode: row.mode,
      sessions: toNumber(row.sessions),
      playTimeMs: toNumber(row.play_time_ms),
      accuracyPercent: accuracyOf(toNumber(row.hits), toNumber(row.attempts)),
      bestScore: toNullableNumber(row.best_score),
      highestCleared: toNumber(row.highest_cleared),
    }));
  }

  async dailyActivityFor(scope: StatisticsScope, since: Date): Promise<DailyActivity[]> {
    const { filter, params } = scoped(scope);
    const rows = await this.dataSource.query<DailyRow[]>(
      `SELECT
         to_char(session.played_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
         COUNT(*) AS sessions,
         SUM(session.score) AS score,
         SUM(session.hits) AS hits,
         SUM(session.hits + session.misses) AS attempts
       FROM training_sessions session
       WHERE ${filter} AND session.played_at >= $${params.length + 1}
       GROUP BY day
       ORDER BY day`,
      [...params, since],
    );

    return rows.map((row) => ({
      day: row.day,
      sessions: toNumber(row.sessions),
      score: toNumber(row.score),
      accuracyPercent: accuracyOf(toNumber(row.hits), toNumber(row.attempts)),
    }));
  }

  async targetsFor(scope: StatisticsScope): Promise<TargetBreakdown[]> {
    const { filter, params } = scoped(scope);
    const rows = await this.dataSource.query<TargetRow[]>(
      `SELECT
         target.target_id,
         SUM(target.attempts) AS attempts,
         SUM(target.correct_hits) AS correct_hits,
         ROUND(
           SUM(target.impact_avg::bigint * target.attempts)
             FILTER (WHERE target.impact_avg IS NOT NULL)::numeric
           / NULLIF(SUM(target.attempts) FILTER (WHERE target.impact_avg IS NOT NULL), 0)
         ) AS impact_average,
         MAX(target.impact_peak) AS impact_peak
       FROM training_session_targets target
       JOIN training_sessions session ON session.id = target.session_id
       WHERE ${filter}
       GROUP BY target.target_id
       ORDER BY target.target_id`,
      params,
    );

    return rows.map((row) => {
      const attempts = toNumber(row.attempts);
      const correctHits = toNumber(row.correct_hits);

      return {
        targetId: toNumber(row.target_id),
        attempts,
        correctHits,
        accuracyPercent: accuracyOf(correctHits, attempts),
        impactAverage: toNullableNumber(row.impact_average),
        impactPeak: toNullableNumber(row.impact_peak),
      };
    });
  }

  async recentSessionsFor(scope: StatisticsScope, limit: number): Promise<RecentSession[]> {
    const { filter, params } = scoped(scope);
    const rows = await this.dataSource.query<RecentRow[]>(
      `SELECT session.id, session.mode, session.level, session.cleared, session.score,
         session.hits, session.misses, session.duration_ms, session.device_kind, session.played_at
       FROM training_sessions session
       WHERE ${filter}
       ORDER BY session.played_at DESC
       LIMIT $${params.length + 1}`,
      [...params, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      mode: row.mode,
      level: row.level,
      cleared: row.cleared,
      score: row.score,
      accuracyPercent: accuracyOf(row.hits, row.hits + row.misses),
      durationMs: row.duration_ms,
      deviceKind: row.device_kind,
      playedAt: row.played_at,
    }));
  }
}
