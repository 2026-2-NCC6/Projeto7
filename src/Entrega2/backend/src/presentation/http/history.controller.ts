import { Controller, Get, Inject, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SessionHistoryQueries } from '../../application/use-cases/session-history-queries';
import { SessionDetail, SessionPage } from '../../domain/training-session/session-history';
import { CurrentUserId } from './current-user-id.decorator';
import { SessionHistoryQueryDto } from './dto/history-query.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Histórico de sessões')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(@Inject(SessionHistoryQueries) private readonly history: SessionHistoryQueries) {}

  @Get('me/sessions')
  mine(@CurrentUserId() userId: string, @Query() query: SessionHistoryQueryDto): Promise<SessionPage> {
    return this.history.mine(userId, query);
  }

  @Get('sessions/:id')
  detail(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SessionDetail> {
    return this.history.detail(userId, id);
  }
}
