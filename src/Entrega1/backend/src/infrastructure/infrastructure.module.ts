import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ID_GENERATOR } from '../application/ports/id-generator.port';
import { PASSWORD_HASHER } from '../application/ports/password-hasher.port';
import { TOKEN_ISSUER, TOKEN_VERIFIER } from '../application/ports/token-issuer.port';
import { DAILY_STREAK_REPOSITORY } from '../domain/daily-streak/daily-streak-repository.port';
import { PROGRESSION_REPOSITORY } from '../domain/progression/progression-repository.port';
import { TRAINING_SESSION_REPOSITORY } from '../domain/training-session/training-session-repository.port';
import { USER_REPOSITORY } from '../domain/user/user-repository.port';
import { buildDataSourceOptions } from './database/database.config';
import { TypeOrmDailyStreakRepository } from './database/repositories/typeorm-daily-streak.repository';
import { TypeOrmProgressionRepository } from './database/repositories/typeorm-progression.repository';
import { TypeOrmTrainingSessionRepository } from './database/repositories/typeorm-training-session.repository';
import { TypeOrmUserRepository } from './database/repositories/typeorm-user.repository';
import { BcryptPasswordHasher } from './security/bcrypt-password-hasher';
import { JwtTokenService } from './security/jwt-token-service';
import { UuidIdGenerator } from './security/uuid-id-generator';

export const DATA_SOURCE = Symbol('DataSource');
const JWT_TOKEN_SERVICE = Symbol('JwtTokenService');

@Global()
@Module({
  providers: [
    {
      provide: DATA_SOURCE,
      useFactory: () => new DataSource(buildDataSourceOptions()).initialize(),
    },
    {
      provide: USER_REPOSITORY,
      inject: [DATA_SOURCE],
      useFactory: (dataSource: DataSource) => new TypeOrmUserRepository(dataSource),
    },
    {
      provide: PROGRESSION_REPOSITORY,
      inject: [DATA_SOURCE],
      useFactory: (dataSource: DataSource) => new TypeOrmProgressionRepository(dataSource),
    },
    {
      provide: DAILY_STREAK_REPOSITORY,
      inject: [DATA_SOURCE],
      useFactory: (dataSource: DataSource) => new TypeOrmDailyStreakRepository(dataSource),
    },
    {
      provide: TRAINING_SESSION_REPOSITORY,
      inject: [DATA_SOURCE],
      useFactory: (dataSource: DataSource) => new TypeOrmTrainingSessionRepository(dataSource),
    },
    {
      provide: PASSWORD_HASHER,
      useFactory: () => new BcryptPasswordHasher(),
    },
    {
      provide: ID_GENERATOR,
      useFactory: () => new UuidIdGenerator(),
    },
    {
      provide: JWT_TOKEN_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new JwtTokenService(
          config.getOrThrow<string>('JWT_SECRET'),
          config.get<string>('JWT_EXPIRES_IN') ?? '7d',
        ),
    },
    {
      provide: TOKEN_ISSUER,
      inject: [JWT_TOKEN_SERVICE],
      useFactory: (service: JwtTokenService) => service,
    },
    {
      provide: TOKEN_VERIFIER,
      inject: [JWT_TOKEN_SERVICE],
      useFactory: (service: JwtTokenService) => service,
    },
  ],
  exports: [
    DATA_SOURCE,
    USER_REPOSITORY,
    PROGRESSION_REPOSITORY,
    DAILY_STREAK_REPOSITORY,
    TRAINING_SESSION_REPOSITORY,
    PASSWORD_HASHER,
    ID_GENERATOR,
    TOKEN_ISSUER,
    TOKEN_VERIFIER,
  ],
})
export class InfrastructureModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown(): Promise<void> {
    const dataSource = this.moduleRef.get<DataSource>(DATA_SOURCE);
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}
