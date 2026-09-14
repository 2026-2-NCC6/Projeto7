import { DataSourceOptions } from 'typeorm';
import { DailyStreakOrmEntity } from './entities/daily-streak.orm-entity';
import { TrainingSessionOrmEntity } from './entities/training-session.orm-entity';
import { TrainingSessionTargetOrmEntity } from './entities/training-session-target.orm-entity';
import { UserOrmEntity } from './entities/user.orm-entity';
import { UserProgressionOrmEntity } from './entities/user-progression.orm-entity';
import { CreateUsersTable1757250000000 } from './migrations/1757250000000-CreateUsersTable';
import { CreateProgressionTables1757260000000 } from './migrations/1757260000000-CreateProgressionTables';
import { AddSessionDetail1757270000000 } from './migrations/1757270000000-AddSessionDetail';
import { AddSessionTelemetry1757280000000 } from './migrations/1757280000000-AddSessionTelemetry';

export function buildDataSourceOptions(env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST ?? '127.0.0.1',
    port: Number(env.DB_PORT ?? 5433),
    username: env.DB_USER ?? 'smash',
    password: env.DB_PASSWORD ?? 'smash',
    database: env.DB_NAME ?? 'smash_entrega1',
    entities: [
      UserOrmEntity,
      UserProgressionOrmEntity,
      DailyStreakOrmEntity,
      TrainingSessionOrmEntity,
      TrainingSessionTargetOrmEntity,
    ],
    migrations: [
      CreateUsersTable1757250000000,
      CreateProgressionTables1757260000000,
      AddSessionDetail1757270000000,
      AddSessionTelemetry1757280000000,
    ],
    synchronize: false,
  };
}
