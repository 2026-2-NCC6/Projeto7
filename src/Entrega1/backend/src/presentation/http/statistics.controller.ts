import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import {
  GetPlayerStatisticsUseCase,
  PlayerStatisticsView,
} from '../../application/use-cases/get-player-statistics.use-case';
import { CurrentUserId } from './current-user-id.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(
    @Inject(GetPlayerStatisticsUseCase)
    private readonly getStatistics: GetPlayerStatisticsUseCase,
  ) {}

  @Get('statistics')
  statistics(@CurrentUserId() userId: string): Promise<PlayerStatisticsView> {
    return this.getStatistics.execute(userId);
  }
}
