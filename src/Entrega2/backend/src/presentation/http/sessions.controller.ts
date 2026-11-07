import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  OfflineSessionView,
  RecordOfflineSessionUseCase,
} from '../../application/use-cases/record-offline-session.use-case';
import {
  RecordedSessionView,
  RecordTrainingSessionUseCase,
} from '../../application/use-cases/record-training-session.use-case';
import {
  StartedSessionView,
  StartTrainingSessionUseCase,
} from '../../application/use-cases/start-training-session.use-case';
import { CurrentUserId } from './current-user-id.decorator';
import {
  RecordOfflineSessionDto,
  RecordSessionDto,
  StartSessionDto,
} from './dto/record-session.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Sessões de treino')
@ApiBearerAuth()
@Controller('me')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(
    @Inject(StartTrainingSessionUseCase)
    private readonly startSession: StartTrainingSessionUseCase,
    @Inject(RecordTrainingSessionUseCase)
    private readonly recordSession: RecordTrainingSessionUseCase,
    @Inject(RecordOfflineSessionUseCase)
    private readonly recordOfflineSession: RecordOfflineSessionUseCase,
  ) {}

  @Post('sessions/start')
  @HttpCode(HttpStatus.CREATED)
  start(
    @CurrentUserId() userId: string,
    @Body() dto: StartSessionDto,
  ): Promise<StartedSessionView> {
    return this.startSession.execute({ userId, ...dto });
  }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  record(
    @CurrentUserId() userId: string,
    @Body() dto: RecordSessionDto,
  ): Promise<RecordedSessionView> {
    return this.recordSession.execute({ userId, ...dto });
  }

  @Post('sessions/offline')
  @HttpCode(HttpStatus.CREATED)
  recordOffline(
    @CurrentUserId() userId: string,
    @Body() dto: RecordOfflineSessionDto,
  ): Promise<OfflineSessionView> {
    return this.recordOfflineSession.execute({ userId, ...dto, playedAt: new Date(dto.playedAt) });
  }
}
