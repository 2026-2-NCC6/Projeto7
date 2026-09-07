import { DataSource, Repository } from 'typeorm';
import { Account } from '../../../domain/user/account';
import { User } from '../../../domain/user/user.entity';
import { UserRepository } from '../../../domain/user/user-repository.port';
import { DailyStreakOrmEntity } from '../entities/daily-streak.orm-entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserProgressionOrmEntity } from '../entities/user-progression.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

export class TypeOrmUserRepository implements UserRepository {
  private readonly repository: Repository<UserOrmEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserOrmEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repository.findOne({ where: { email } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async register({ user, progressions, dailyStreak }: Account): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(UserOrmEntity).insert(UserMapper.toPersistence(user));

      await manager.getRepository(UserProgressionOrmEntity).insert(
        progressions.map((progression) => ({
          userId: progression.userId,
          track: progression.track,
          level: progression.level,
          xp: progression.xp,
        })),
      );

      await manager.getRepository(DailyStreakOrmEntity).insert({
        userId: dailyStreak.userId,
        currentStreak: dailyStreak.currentStreak,
        longestStreak: dailyStreak.longestStreak,
        lastCompletedOn: dailyStreak.lastCompletedOn,
      });
    });
  }
}
