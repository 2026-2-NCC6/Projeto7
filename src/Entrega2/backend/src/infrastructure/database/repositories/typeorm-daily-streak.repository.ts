import { DataSource, Repository } from 'typeorm';
import { DailyStreak } from '../../../domain/daily-streak/daily-streak.entity';
import { DailyStreakRepository } from '../../../domain/daily-streak/daily-streak-repository.port';
import { DailyStreakOrmEntity } from '../entities/daily-streak.orm-entity';

export class TypeOrmDailyStreakRepository implements DailyStreakRepository {
  private readonly repository: Repository<DailyStreakOrmEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(DailyStreakOrmEntity);
  }

  async findByUser(userId: string): Promise<DailyStreak | null> {
    const row = await this.repository.findOne({ where: { userId } });

    return row
      ? DailyStreak.restore({
          userId: row.userId,
          currentStreak: row.currentStreak,
          longestStreak: row.longestStreak,
          lastCompletedOn: row.lastCompletedOn,
        })
      : null;
  }
}
