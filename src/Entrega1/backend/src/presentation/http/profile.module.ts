import { Module } from '@nestjs/common';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
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
import { RANKING_REPOSITORY, RankingRepository } from '../../domain/ranking/ranking-repository.port';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user-repository.port';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProfileController } from './profile.controller';

@Module({
  controllers: [ProfileController],
  providers: [
    JwtAuthGuard,
    {
      provide: GetProfileUseCase,
      inject: [
        USER_REPOSITORY,
        PROGRESSION_REPOSITORY,
        DAILY_STREAK_REPOSITORY,
        TRAINING_SESSION_REPOSITORY,
        RANKING_REPOSITORY,
      ],
      useFactory: (
        users: UserRepository,
        progressions: ProgressionRepository,
        dailyStreaks: DailyStreakRepository,
        sessions: TrainingSessionRepository,
        rankings: RankingRepository,
      ) => new GetProfileUseCase(users, progressions, dailyStreaks, sessions, rankings),
    },
  ],
})
export class ProfileModule {}
