import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import {
  GetHomeOverviewUseCase,
  HomeOverview,
} from '../../application/use-cases/get-home-overview.use-case';
import { CurrentUserId } from './current-user-id.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(
    @Inject(GetHomeOverviewUseCase) private readonly getHomeOverview: GetHomeOverviewUseCase,
  ) {}

  @Get('home')
  home(@CurrentUserId() userId: string): Promise<HomeOverview> {
    return this.getHomeOverview.execute(userId);
  }
}
