import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import {
  RecordedSessionView,
  RecordTrainingSessionUseCase,
} from '../../application/use-cases/record-training-session.use-case';
import {
  StartedSessionView,
  StartTrainingSessionUseCase,
} from '../../application/use-cases/start-training-session.use-case';
import { CurrentUserId } from './current-user-id.decorator';
import { RecordSessionDto } from './dto/record-session.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(
    @Inject(StartTrainingSessionUseCase)
    private readonly startSession: StartTrainingSessionUseCase,
    @Inject(RecordTrainingSessionUseCase)
    private readonly recordSession: RecordTrainingSessionUseCase,
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
}
