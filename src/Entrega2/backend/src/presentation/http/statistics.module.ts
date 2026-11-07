import { Module } from '@nestjs/common';
import { GetPlayerStatisticsUseCase } from '../../application/use-cases/get-player-statistics.use-case';
import {
  DAILY_STREAK_REPOSITORY,
  DailyStreakRepository,
} from '../../domain/daily-streak/daily-streak-repository.port';
import {
  PROGRESSION_REPOSITORY,
  ProgressionRepository,
} from '../../domain/progression/progression-repository.port';
import { RANKING_REPOSITORY, RankingRepository } from '../../domain/ranking/ranking-repository.port';
import {
  STATISTICS_REPOSITORY,
  StatisticsRepository,
} from '../../domain/statistics/statistics-repository.port';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user-repository.port';
import { JwtAuthGuard } from './jwt-auth.guard';
import { StatisticsController } from './statistics.controller';

@Module({
  controllers: [StatisticsController],
  providers: [
    JwtAuthGuard,
    {
      provide: GetPlayerStatisticsUseCase,
      inject: [
        USER_REPOSITORY,
        PROGRESSION_REPOSITORY,
        DAILY_STREAK_REPOSITORY,
        STATISTICS_REPOSITORY,
        RANKING_REPOSITORY,
      ],
      useFactory: (
        users: UserRepository,
        progressions: ProgressionRepository,
        dailyStreaks: DailyStreakRepository,
        statistics: StatisticsRepository,
        rankings: RankingRepository,
      ) => new GetPlayerStatisticsUseCase(users, progressions, dailyStreaks, statistics, rankings),
    },
  ],
})
export class StatisticsModule {}
