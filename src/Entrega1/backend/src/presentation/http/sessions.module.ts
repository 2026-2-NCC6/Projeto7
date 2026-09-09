import { Module } from '@nestjs/common';
import { RecordTrainingSessionUseCase } from '../../application/use-cases/record-training-session.use-case';
import { ID_GENERATOR, IdGenerator } from '../../application/ports/id-generator.port';
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
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [
    JwtAuthGuard,
    {
      provide: RecordTrainingSessionUseCase,
      inject: [
        USER_REPOSITORY,
        PROGRESSION_REPOSITORY,
        DAILY_STREAK_REPOSITORY,
        TRAINING_SESSION_REPOSITORY,
        ID_GENERATOR,
      ],
      useFactory: (
        users: UserRepository,
        progressions: ProgressionRepository,
        dailyStreaks: DailyStreakRepository,
        sessions: TrainingSessionRepository,
        ids: IdGenerator,
      ) =>
        new RecordTrainingSessionUseCase(users, progressions, dailyStreaks, sessions, ids),
    },
  ],
})
export class SessionsModule {}
