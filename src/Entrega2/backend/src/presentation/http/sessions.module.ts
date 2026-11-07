import { Module } from '@nestjs/common';
import { RecordOfflineSessionUseCase } from '../../application/use-cases/record-offline-session.use-case';
import { RecordTrainingSessionUseCase } from '../../application/use-cases/record-training-session.use-case';
import { StartTrainingSessionUseCase } from '../../application/use-cases/start-training-session.use-case';
import { ID_GENERATOR, IdGenerator } from '../../application/ports/id-generator.port';
import { SESSION_TICKETS, SessionTickets } from '../../application/ports/session-ticket.port';
import {
  DAILY_STREAK_REPOSITORY,
  DailyStreakRepository,
} from '../../domain/daily-streak/daily-streak-repository.port';
import {
  PROGRESSION_REPOSITORY,
  ProgressionRepository,
} from '../../domain/progression/progression-repository.port';
import {
  TRAINING_SESSION_REPOSITORY,
  TrainingSessionRepository,
} from '../../domain/training-session/training-session-repository.port';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user-repository.port';
import { AUDIT_LOG, AuditLog } from '../../domain/audit/audit-event';
import {
  TRAINING_REPOSITORY,
  TrainingRepository,
} from '../../domain/training/training-repository.port';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [
    JwtAuthGuard,
    {
      provide: StartTrainingSessionUseCase,
      inject: [
        USER_REPOSITORY,
        TRAINING_SESSION_REPOSITORY,
        SESSION_TICKETS,
        ID_GENERATOR,
        TRAINING_REPOSITORY,
      ],
      useFactory: (
        users: UserRepository,
        sessions: TrainingSessionRepository,
        tickets: SessionTickets,
        ids: IdGenerator,
        trainings: TrainingRepository,
      ) => new StartTrainingSessionUseCase(users, sessions, tickets, ids, trainings),
    },
    {
      provide: RecordTrainingSessionUseCase,
      inject: [
        USER_REPOSITORY,
        PROGRESSION_REPOSITORY,
        DAILY_STREAK_REPOSITORY,
        TRAINING_SESSION_REPOSITORY,
        ID_GENERATOR,
        SESSION_TICKETS,
        AUDIT_LOG,
      ],
      useFactory: (
        users: UserRepository,
        progressions: ProgressionRepository,
        dailyStreaks: DailyStreakRepository,
        sessions: TrainingSessionRepository,
        ids: IdGenerator,
        tickets: SessionTickets,
        audit: AuditLog,
      ) =>
        new RecordTrainingSessionUseCase(
          users,
          progressions,
          dailyStreaks,
          sessions,
          ids,
          tickets,
          audit,
        ),
    },
    {
      provide: RecordOfflineSessionUseCase,
      inject: [
        USER_REPOSITORY,
        TRAINING_SESSION_REPOSITORY,
        TRAINING_REPOSITORY,
        ID_GENERATOR,
        AUDIT_LOG,
      ],
      useFactory: (
        users: UserRepository,
        sessions: TrainingSessionRepository,
        trainings: TrainingRepository,
        ids: IdGenerator,
        audit: AuditLog,
      ) => new RecordOfflineSessionUseCase(users, sessions, trainings, ids, audit),
    },
  ],
})
export class SessionsModule {}
