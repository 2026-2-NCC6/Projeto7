import { Module } from '@nestjs/common';
import { ID_GENERATOR, IdGenerator } from '../../application/ports/id-generator.port';
import { Administration } from '../../application/use-cases/administration';
import { SessionHistoryQueries } from '../../application/use-cases/session-history-queries';
import { TrainingCatalog } from '../../application/use-cases/training-catalog';
import { TrainingStudio } from '../../application/use-cases/training-studio';
import { AUDIT_LOG, AuditLog } from '../../domain/audit/audit-event';
import {
  STATISTICS_REPOSITORY,
  StatisticsRepository,
} from '../../domain/statistics/statistics-repository.port';
import {
  TRAINING_REPOSITORY,
  TrainingRepository,
} from '../../domain/training/training-repository.port';
import {
  SESSION_HISTORY_REPOSITORY,
  SessionHistoryRepository,
} from '../../domain/training-session/session-history';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user-repository.port';
import { AdminController } from './admin.controller';
import { HistoryController } from './history.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { StudioController } from './studio.controller';
import { TrainingsController } from './trainings.controller';

@Module({
  controllers: [TrainingsController, StudioController, AdminController, HistoryController],
  providers: [
    JwtAuthGuard,
    {
      provide: TrainingCatalog,
      inject: [TRAINING_REPOSITORY],
      useFactory: (trainings: TrainingRepository) => new TrainingCatalog(trainings),
    },
    {
      provide: TrainingStudio,
      inject: [
        USER_REPOSITORY,
        TRAINING_REPOSITORY,
        STATISTICS_REPOSITORY,
        SESSION_HISTORY_REPOSITORY,
        ID_GENERATOR,
        AUDIT_LOG,
      ],
      useFactory: (
        users: UserRepository,
        trainings: TrainingRepository,
        statistics: StatisticsRepository,
        history: SessionHistoryRepository,
        ids: IdGenerator,
        audit: AuditLog,
      ) => new TrainingStudio(users, trainings, statistics, history, ids, audit),
    },
    {
      provide: Administration,
      inject: [
        USER_REPOSITORY,
        TRAINING_REPOSITORY,
        STATISTICS_REPOSITORY,
        SESSION_HISTORY_REPOSITORY,
        AUDIT_LOG,
      ],
      useFactory: (
        users: UserRepository,
        trainings: TrainingRepository,
        statistics: StatisticsRepository,
        history: SessionHistoryRepository,
        audit: AuditLog,
      ) => new Administration(users, trainings, statistics, history, audit),
    },
    {
      provide: SessionHistoryQueries,
      inject: [USER_REPOSITORY, SESSION_HISTORY_REPOSITORY],
      useFactory: (users: UserRepository, history: SessionHistoryRepository) =>
        new SessionHistoryQueries(users, history),
    },
  ],
})
export class PlatformModule {}
