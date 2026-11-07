import { Module } from '@nestjs/common';
import { GetHomeOverviewUseCase } from '../../application/use-cases/get-home-overview.use-case';
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
import { HomeController } from './home.controller';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  controllers: [HomeController],
  providers: [
    JwtAuthGuard,
    {
      provide: GetHomeOverviewUseCase,
      inject: [
        USER_REPOSITORY,
        PROGRESSION_REPOSITORY,
        DAILY_STREAK_REPOSITORY,
        TRAINING_SESSION_REPOSITORY,
      ],
      useFactory: (
        users: UserRepository,
        progressions: ProgressionRepository,
        dailyStreaks: DailyStreakRepository,
        sessions: TrainingSessionRepository,
      ) => new GetHomeOverviewUseCase(users, progressions, dailyStreaks, sessions),
    },
  ],
})
export class HomeModule {}
