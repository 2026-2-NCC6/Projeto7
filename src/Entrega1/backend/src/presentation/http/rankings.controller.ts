import { Controller, Get, Inject, Param, Req, UseGuards } from '@nestjs/common';
import {
  GetLeaderboardUseCase,
  LeaderboardView,
} from '../../application/use-cases/get-leaderboard.use-case';
import { RankingCategory } from '../../domain/ranking/ranking-category';
import { AuthenticatedRequest } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { RankingCategoryPipe } from './ranking-category.pipe';

@Controller('rankings')
@UseGuards(OptionalJwtAuthGuard)
export class RankingsController {
  constructor(
    @Inject(GetLeaderboardUseCase) private readonly getLeaderboard: GetLeaderboardUseCase,
  ) {}

  @Get(':category')
  leaderboard(
    @Param('category', RankingCategoryPipe) category: RankingCategory,
    @Req() request: AuthenticatedRequest,
  ): Promise<LeaderboardView> {
    return this.getLeaderboard.execute(category, request.userId ?? null);
  }
}
