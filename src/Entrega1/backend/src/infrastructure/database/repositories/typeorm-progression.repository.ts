import { DataSource, Repository } from 'typeorm';
import { ProgressionTrack } from '../../../domain/game/game-mode';
import { Progression } from '../../../domain/progression/progression.entity';
import { ProgressionRepository } from '../../../domain/progression/progression-repository.port';
import { UserProgressionOrmEntity } from '../entities/user-progression.orm-entity';

function toDomain(row: UserProgressionOrmEntity): Progression {
  return Progression.restore({
    userId: row.userId,
    track: row.track,
    level: row.level,
    xp: row.xp,
  });
}

export class TypeOrmProgressionRepository implements ProgressionRepository {
  private readonly repository: Repository<UserProgressionOrmEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserProgressionOrmEntity);
  }

  async findByUser(userId: string): Promise<Progression[]> {
    const rows = await this.repository.find({ where: { userId }, order: { track: 'ASC' } });

    return rows.map(toDomain);
  }

  async findByTrack(userId: string, track: ProgressionTrack): Promise<Progression | null> {
    const row = await this.repository.findOne({ where: { userId, track } });

    return row ? toDomain(row) : null;
  }
}
