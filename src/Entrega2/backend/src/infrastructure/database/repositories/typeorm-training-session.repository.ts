import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { GAME_MODES, GameMode, LEVEL_MODES } from '../../../domain/game/game-mode';
import { CompletedTraining } from '../../../domain/training-session/completed-training';
import { SessionAlreadyRecordedError } from '../../../domain/training-session/errors';
import { SessionInsights } from '../../../domain/training-session/session-insights';
import { SessionStats } from '../../../domain/training-session/session-stats';
import { TrainingSession } from '../../../domain/training-session/training-session.entity';
import { TrainingSessionRepository } from '../../../domain/training-session/training-session-repository.port';
import { DailyStreakOrmEntity } from '../entities/daily-streak.orm-entity';
import { TrainingSessionOrmEntity } from '../entities/training-session.orm-entity';
import { TrainingSessionTargetOrmEntity } from '../entities/training-session-target.orm-entity';
import { UserProgressionOrmEntity } from '../entities/user-progression.orm-entity';

interface StatsRow {
  totalSessions: string | null;
  bestStreak: string | null;
  totalScore: string | null;
}

type InsightsRow = {
  totalHits: string | null;
  totalAttempts: string | null;
  bestScore: string | null;
  fastestLevelMs: string | null;
  longestHitStreak: string | null;
} & Record<GameMode, string | null> &
  Record<`cleared_${GameMode}`, string | null>;

const ONE_RESULT_CONSTRAINTS = ['uq_training_sessions_ticket', 'uq_training_sessions_client'];
const ATTEMPT_COLUMNS = 8;

function isRepeatedResult(error: unknown): boolean {
  const driverError = error instanceof QueryFailedError ? error.driverError : null;
  return driverError?.code === '23505' && ONE_RESULT_CONSTRAINTS.includes(driverError?.constraint);
}

function placeholdersFor(rows: number): string {
  return Array.from({ length: rows }, (_, row) => {
    const columns = Array.from(
      { length: ATTEMPT_COLUMNS },
      (_, column) => `$${row * ATTEMPT_COLUMNS + column + 1}`,
    );
    return `(${columns.join(', ')})`;
  }).join(', ');
}

async function insertSession(manager: EntityManager, session: TrainingSession): Promise<void> {
  await manager.getRepository(TrainingSessionOrmEntity).insert({
    id: session.id,
    ticketId: session.ticketId,
    userId: session.userId,
    mode: session.mode,
    level: session.level,
    cleared: session.cleared,
    score: session.score,
    hits: session.hits,
    misses: session.misses,
    bestStreak: session.bestStreak,
    durationMs: session.durationMs,
    xpAwarded: session.xpAwarded,
    avgResponseMs: session.avgResponseMs,
    bestResponseMs: session.bestResponseMs,
    deviceKind: session.deviceKind,
    trainingId: session.training?.id ?? null,
    trainingVersion: session.training?.version ?? null,
    stepIndex: session.training?.stepIndex ?? null,
    endReason: session.endReason,
    stopReason: session.stopReason,
    pauses: session.interruptions.pauses,
    deviceLosses: session.interruptions.deviceLosses,
    faults: session.interruptions.faults,
    offline: session.offline,
    clientSessionId: session.clientSessionId,
    deviceId: session.deviceId,
    playedAt: session.playedAt,
  });

  if (session.targets.length > 0) {
    await manager.getRepository(TrainingSessionTargetOrmEntity).insert(
      session.targets.map((target) => ({ sessionId: session.id, ...target })),
    );
  }

  if (session.attempts.length > 0) {
    const values = session.attempts.flatMap((attempt, seq) => [
      session.id,
      seq,
      Math.round(attempt.atMs),
      Math.round(attempt.responseMs),
      attempt.verdict,
      attempt.targetId,
      Math.round(attempt.scoreDelta),
      attempt.intensity,
    ]);

    await manager.query(
      `INSERT INTO training_session_attempts
         (session_id, seq, at_ms, response_ms, verdict, target_id, score_delta, intensity)
       VALUES ${placeholdersFor(session.attempts.length)}`,
      values,
    );
  }
}

function toNullableNumber(value: string | null | undefined): number | null {
  return value === null || value === undefined ? null : Number(value);
}

function selectSessionsPerMode(
  query: SelectQueryBuilder<TrainingSessionOrmEntity>,
): SelectQueryBuilder<TrainingSessionOrmEntity> {
  return GAME_MODES.reduce(
    (builder, mode) =>
      builder
        .addSelect(`COUNT(*) FILTER (WHERE session.mode = '${mode}')`, mode)
        .addSelect(
          `COALESCE(MAX(session.level) FILTER (WHERE session.mode = '${mode}' AND session.cleared AND NOT session.offline), 0)`,
          `cleared_${mode}`,
        ),
    query,
  );
}

function perMode(
  row: InsightsRow | undefined,
  key: (mode: GameMode) => keyof InsightsRow,
): Record<GameMode, number> {
  return GAME_MODES.reduce(
    (counts, mode) => ({ ...counts, [mode]: Number(row?.[key(mode)] ?? 0) }),
    {} as Record<GameMode, number>,
  );
}

export class TypeOrmTrainingSessionRepository implements TrainingSessionRepository {
  private readonly repository: Repository<TrainingSessionOrmEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(TrainingSessionOrmEntity);
  }

  async commit(completed: CompletedTraining): Promise<void> {
    try {
      await this.insert(completed);
    } catch (error) {
      throw isRepeatedResult(error) ? new SessionAlreadyRecordedError() : error;
    }
  }

  async commitOffline(session: TrainingSession): Promise<void> {
    try {
      await this.dataSource.transaction((manager) => insertSession(manager, session));
    } catch (error) {
      throw isRepeatedResult(error) ? new SessionAlreadyRecordedError() : error;
    }
  }

  private async insert({ session, progression, dailyStreak }: CompletedTraining): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await insertSession(manager, session);

      await manager
        .getRepository(UserProgressionOrmEntity)
        .update(
          { userId: progression.userId, track: progression.track },
          { level: progression.level, xp: progression.xp },
        );

      await manager
        .getRepository(DailyStreakOrmEntity)
        .update(
          { userId: dailyStreak.userId },
          {
            currentStreak: dailyStreak.currentStreak,
            longestStreak: dailyStreak.longestStreak,
            lastCompletedOn: dailyStreak.lastCompletedOn,
          },
        );
    });
  }

  async statsFor(userId: string): Promise<SessionStats> {
    const row = await this.repository
      .createQueryBuilder('session')
      .select('COUNT(*)', 'totalSessions')
      .addSelect('COALESCE(MAX(session.best_streak), 0)', 'bestStreak')
      .addSelect('COALESCE(SUM(session.score), 0)', 'totalScore')
      .where('session.user_id = :userId', { userId })
      .getRawOne<StatsRow>();

    return {
      totalSessions: Number(row?.totalSessions ?? 0),
      bestStreak: Number(row?.bestStreak ?? 0),
      totalScore: Number(row?.totalScore ?? 0),
    };
  }

  async insightsFor(userId: string): Promise<SessionInsights> {
    const query = this.repository
      .createQueryBuilder('session')
      .select('SUM(session.hits)', 'totalHits')
      .addSelect('SUM(session.hits + session.misses)', 'totalAttempts')
      .addSelect('MAX(session.score)', 'bestScore')
      .addSelect(
        `MIN(session.duration_ms) FILTER (WHERE session.mode IN (:...levelModes)
          AND session.cleared AND session.training_id IS NULL AND NOT session.offline)`,
        'fastestLevelMs',
      )
      .addSelect('MAX(session.best_streak)', 'longestHitStreak')
      .where('session.user_id = :userId', { userId })
      .setParameter('levelModes', LEVEL_MODES);

    const row = await selectSessionsPerMode(query).getRawOne<InsightsRow>();

    const totalAttempts = Number(row?.totalAttempts ?? 0);
    const totalHits = Number(row?.totalHits ?? 0);

    return {
      accuracyPercent: totalAttempts > 0 ? (totalHits / totalAttempts) * 100 : null,
      records: {
        bestScore: toNullableNumber(row?.bestScore),
        fastestLevelMs: toNullableNumber(row?.fastestLevelMs),
        longestHitStreak: toNullableNumber(row?.longestHitStreak),
      },
      sessionsByMode: perMode(row, (mode) => mode),
      highestClearedByMode: perMode(row, (mode) => `cleared_${mode}`),
    };
  }
}
