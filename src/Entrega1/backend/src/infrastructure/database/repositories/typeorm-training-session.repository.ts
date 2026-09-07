import { DataSource, Repository } from 'typeorm';
import { SessionStats } from '../../../domain/training-session/session-stats';
import { TrainingSessionRepository } from '../../../domain/training-session/training-session-repository.port';
import { TrainingSessionOrmEntity } from '../entities/training-session.orm-entity';

interface StatsRow {
  totalSessions: string | null;
  bestStreak: string | null;
  totalScore: string | null;
}

export class TypeOrmTrainingSessionRepository implements TrainingSessionRepository {
  private readonly repository: Repository<TrainingSessionOrmEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(TrainingSessionOrmEntity);
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
}
