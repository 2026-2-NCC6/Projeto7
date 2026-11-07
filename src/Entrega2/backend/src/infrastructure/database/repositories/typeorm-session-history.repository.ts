import { DataSource } from 'typeorm';
import { GameMode } from '../../../domain/game/game-mode';
import { accuracyOf } from '../../../domain/statistics/statistics-rules';
import { DeviceKind } from '../../../domain/training-session/device-kind';
import { AttemptVerdict, EndReason } from '../../../domain/training-session/session-context';
import {
  DeviceUsage,
  OperationCounts,
  SessionDetail,
  SessionHistoryFilter,
  SessionHistoryRepository,
  SessionPage,
  SessionSummary,
} from '../../../domain/training-session/session-history';

interface SummaryRow {
  id: string;
  user_id: string;
  player_name: string;
  mode: GameMode;
  level: number;
  cleared: boolean;
  score: number;
  hits: number;
  misses: number;
  duration_ms: number;
  xp_awarded: number;
  device_kind: DeviceKind;
  device_id: string | null;
  training_id: string | null;
  training_version: number | null;
  step_index: number | null;
  training_title: string | null;
  end_reason: EndReason | null;
  offline: boolean;
  played_at: Date;
  total?: string;
}

interface DetailRow extends SummaryRow {
  best_streak: number;
  avg_response_ms: number | null;
  best_response_ms: number | null;
  stop_reason: string | null;
  pauses: number;
  device_losses: number;
  faults: number;
  training_author_id: string | null;
}

interface AttemptRow {
  at_ms: number;
  response_ms: number;
  verdict: AttemptVerdict;
  target_id: number | null;
  score_delta: number;
  intensity: number | null;
}

interface TargetRow {
  target_id: number;
  attempts: number;
  correct_hits: number;
  impact_avg: number | null;
  impact_peak: number | null;
}

interface DeviceRow {
  device_id: string;
  device_kind: DeviceKind;
  sessions: string;
  players: string;
  emergency_stops: string;
  device_losses: string;
  faults: string;
  last_seen_at: Date;
}

const SUMMARY_SELECT = `
  SELECT session.id, session.user_id, player.name AS player_name, session.mode, session.level,
    session.cleared, session.score, session.hits, session.misses, session.duration_ms,
    session.xp_awarded, session.device_kind, session.device_id, session.training_id,
    session.training_version, session.step_index, version.content->>'title' AS training_title,
    session.end_reason, session.offline, session.played_at`;

const SUMMARY_FROM = `
  FROM training_sessions session
  JOIN users player ON player.id = session.user_id
  LEFT JOIN trainings training ON training.id = session.training_id
  LEFT JOIN training_versions version
    ON version.training_id = session.training_id AND version.version = session.training_version`;

function toSummary(row: SummaryRow): SessionSummary {
  return {
    id: row.id,
    userId: row.user_id,
    playerName: row.player_name,
    mode: row.mode,
    level: row.level,
    cleared: row.cleared,
    score: row.score,
    hits: row.hits,
    misses: row.misses,
    accuracyPercent: accuracyOf(row.hits, row.hits + row.misses),
    durationMs: row.duration_ms,
    xpAwarded: row.xp_awarded,
    deviceKind: row.device_kind,
    deviceId: row.device_id,
    training:
      row.training_id && row.training_version !== null && row.step_index !== null
        ? {
            id: row.training_id,
            version: row.training_version,
            stepIndex: row.step_index,
            title: row.training_title,
          }
        : null,
    endReason: row.end_reason,
    offline: row.offline,
    playedAt: row.played_at,
  };
}

export class TypeOrmSessionHistoryRepository implements SessionHistoryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async list(filter: SessionHistoryFilter): Promise<SessionPage> {
    const params: unknown[] = [];
    const clauses: string[] = [];
    const add = (clause: (placeholder: string) => string, value: unknown) => {
      if (value !== undefined && value !== null) {
        params.push(value);
        clauses.push(clause(`$${params.length}`));
      }
    };

    add((value) => `session.user_id = ${value}`, filter.userId);
    add((value) => `session.training_id = ${value}`, filter.trainingId);
    add((value) => `training.author_id = ${value}`, filter.authorId);
    add((value) => `session.played_at >= ${value}`, filter.from);
    add((value) => `session.played_at < ${value}`, filter.to);

    const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await this.dataSource.query<SummaryRow[]>(
      `${SUMMARY_SELECT}, COUNT(*) OVER () AS total ${SUMMARY_FROM} ${where}
       ORDER BY session.played_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, filter.limit, filter.offset],
    );

    return { items: rows.map(toSummary), total: Number(rows[0]?.total ?? 0) };
  }

  async detail(id: string): Promise<SessionDetail | null> {
    const [row] = await this.dataSource.query<DetailRow[]>(
      `${SUMMARY_SELECT}, session.best_streak, session.avg_response_ms, session.best_response_ms,
         session.stop_reason, session.pauses, session.device_losses, session.faults,
         training.author_id AS training_author_id
       ${SUMMARY_FROM}
       WHERE session.id = $1`,
      [id],
    );

    if (!row) {
      return null;
    }

    const [targets, attempts] = await Promise.all([
      this.dataSource.query<TargetRow[]>(
        `SELECT target_id, attempts, correct_hits, impact_avg, impact_peak
         FROM training_session_targets WHERE session_id = $1 ORDER BY target_id`,
        [id],
      ),
      this.dataSource.query<AttemptRow[]>(
        `SELECT at_ms, response_ms, verdict, target_id, score_delta, intensity
         FROM training_session_attempts WHERE session_id = $1 ORDER BY seq`,
        [id],
      ),
    ]);

    return {
      ...toSummary(row),
      bestStreak: row.best_streak,
      avgResponseMs: row.avg_response_ms,
      bestResponseMs: row.best_response_ms,
      stopReason: row.stop_reason,
      interruptions: { pauses: row.pauses, deviceLosses: row.device_losses, faults: row.faults },
      trainingAuthorId: row.training_author_id,
      targets: targets.map((target) => ({
        targetId: target.target_id,
        attempts: target.attempts,
        correctHits: target.correct_hits,
        impactAverage: target.impact_avg,
        impactPeak: target.impact_peak,
      })),
      attempts: attempts.map((attempt) => ({
        atMs: attempt.at_ms,
        responseMs: attempt.response_ms,
        verdict: attempt.verdict,
        targetId: attempt.target_id,
        scoreDelta: attempt.score_delta,
        intensity: attempt.intensity,
      })),
    };
  }

  async devices(): Promise<DeviceUsage[]> {
    const rows = await this.dataSource.query<DeviceRow[]>(
      `SELECT COALESCE(device_id, device_kind) AS device_id, device_kind,
         COUNT(*) AS sessions,
         COUNT(DISTINCT user_id) AS players,
         COUNT(*) FILTER (WHERE end_reason = 'emergencyStop') AS emergency_stops,
         SUM(device_losses) AS device_losses,
         SUM(faults) AS faults,
         MAX(played_at) AS last_seen_at
       FROM training_sessions
       GROUP BY COALESCE(device_id, device_kind), device_kind
       ORDER BY last_seen_at DESC`,
    );

    return rows.map((row) => ({
      deviceId: row.device_id,
      deviceKind: row.device_kind,
      sessions: Number(row.sessions),
      players: Number(row.players),
      emergencyStops: Number(row.emergency_stops),
      deviceLosses: Number(row.device_losses),
      faults: Number(row.faults),
      lastSeenAt: row.last_seen_at,
    }));
  }

  async operationCounts(): Promise<OperationCounts> {
    const [row] = await this.dataSource.query<
      { emergency_stops: string; offline_sessions: string; training_sessions: string }[]
    >(
      `SELECT
         COUNT(*) FILTER (WHERE end_reason = 'emergencyStop') AS emergency_stops,
         COUNT(*) FILTER (WHERE offline) AS offline_sessions,
         COUNT(*) FILTER (WHERE training_id IS NOT NULL) AS training_sessions
       FROM training_sessions`,
    );

    return {
      emergencyStops: Number(row?.emergency_stops ?? 0),
      offlineSessions: Number(row?.offline_sessions ?? 0),
      trainingSessions: Number(row?.training_sessions ?? 0),
    };
  }
}
