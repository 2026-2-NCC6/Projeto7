import { DataSource, Repository } from 'typeorm';
import { Progression } from '../../../domain/progression/progression.entity';
import { ProgressionRepository } from '../../../domain/progression/progression-repository.port';
import { UserProgressionOrmEntity } from '../entities/user-progression.orm-entity';

export class TypeOrmProgressionRepository implements ProgressionRepository {
  private readonly repository: Repository<UserProgressionOrmEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserProgressionOrmEntity);
  }

  async findByUser(userId: string): Promise<Progression[]> {
    const rows = await this.repository.find({ where: { userId }, order: { track: 'ASC' } });

    return rows.map((row) =>
      Progression.restore({
        userId: row.userId,
        track: row.track,
        level: row.level,
        xp: row.xp,
      }),
    );
  }
}
