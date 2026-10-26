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
import { ShrinkWallToSixTargets1757290000000 } from './migrations/1757290000000-ShrinkWallToSixTargets';
import { AddUserTokenVersion1757300000000 } from './migrations/1757300000000-AddUserTokenVersion';

/** Credentials have no fallback: a missing one stops the API instead of trying a known password. */
function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];

  if (!value) {
    throw new Error(`${name} não definido. Copie backend/.env.example para backend/.env.`);
  }

  return value;
}

export function buildDataSourceOptions(env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST ?? '127.0.0.1',
    port: Number(env.DB_PORT ?? 5433),
    username: required(env, 'DB_USER'),
    password: required(env, 'DB_PASSWORD'),
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
      ShrinkWallToSixTargets1757290000000,
      AddUserTokenVersion1757300000000,
    ],
    synchronize: false,
  };
}
