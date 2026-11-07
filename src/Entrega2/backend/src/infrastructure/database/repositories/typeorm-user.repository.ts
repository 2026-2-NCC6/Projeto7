import { DataSource, Repository } from 'typeorm';

interface UserListRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age_group: string | null;
  sessions: string;
  last_played_at: Date | null;
  created_at: Date;
  total: string;
}
import { Account } from '../../../domain/user/account';
import { User } from '../../../domain/user/user.entity';
import { USER_ROLES, UserRole } from '../../../domain/user/role';
import {
  UserListFilter,
  UserPage,
  UserRepository,
} from '../../../domain/user/user-repository.port';
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

  async revokeTokens(userId: string): Promise<void> {
    await this.repository.increment({ id: userId }, 'tokenVersion', 1);
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

  async save(user: User): Promise<void> {
    const row = UserMapper.toPersistence(user);
    await this.repository.update(
      { id: user.id },
      {
        name: row.name,
        role: row.role,
        ageGroup: row.ageGroup,
        skillLevel: row.skillLevel,
        goals: row.goals,
        dominantHand: row.dominantHand,
        restrictions: row.restrictions,
      },
    );
  }

  async list({ search, role, limit, offset }: UserListFilter): Promise<UserPage> {
    const rows = await this.dataSource.query<UserListRow[]>(
      `SELECT users.id, users.name, users.email, users.role, users.age_group, users.created_at,
         COUNT(session.id) AS sessions,
         MAX(session.played_at) AS last_played_at,
         COUNT(*) OVER () AS total
       FROM users
       LEFT JOIN training_sessions session ON session.user_id = users.id
       WHERE ($1::text IS NULL OR users.name ILIKE '%' || $1 || '%' OR users.email ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR users.role = $2)
       GROUP BY users.id
       ORDER BY users.created_at DESC
       LIMIT $3 OFFSET $4`,
      [search?.trim() || null, role ?? null, limit, offset],
    );

    return {
      total: Number(rows[0]?.total ?? 0),
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        ageGroup: row.age_group,
        sessions: Number(row.sessions),
        lastPlayedAt: row.last_played_at,
        createdAt: row.created_at,
      })),
    };
  }

  async countByRole(): Promise<Record<UserRole, number>> {
    const rows = await this.dataSource.query<{ role: UserRole; total: string }[]>(
      `SELECT role, COUNT(*) AS total FROM users GROUP BY role`,
    );

    return USER_ROLES.reduce(
      (counts, role) => ({
        ...counts,
        [role]: Number(rows.find((row) => row.role === role)?.total ?? 0),
      }),
      {} as Record<UserRole, number>,
    );
  }
}
