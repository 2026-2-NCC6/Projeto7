import { Module } from '@nestjs/common';
import { GetLeaderboardUseCase } from '../../application/use-cases/get-leaderboard.use-case';
import { RANKING_REPOSITORY, RankingRepository } from '../../domain/ranking/ranking-repository.port';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { RankingsController } from './rankings.controller';

@Module({
  controllers: [RankingsController],
  providers: [
    OptionalJwtAuthGuard,
    {
      provide: GetLeaderboardUseCase,
      inject: [RANKING_REPOSITORY],
      useFactory: (rankings: RankingRepository) => new GetLeaderboardUseCase(rankings),
    },
  ],
})
export class RankingsModule {}
