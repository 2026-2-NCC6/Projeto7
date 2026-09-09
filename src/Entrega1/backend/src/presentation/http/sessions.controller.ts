import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import {
  RecordedSessionView,
  RecordTrainingSessionUseCase,
} from '../../application/use-cases/record-training-session.use-case';
import { CurrentUserId } from './current-user-id.decorator';
import { RecordSessionDto } from './dto/record-session.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(
    @Inject(RecordTrainingSessionUseCase)
    private readonly recordSession: RecordTrainingSessionUseCase,
  ) {}

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  record(
    @CurrentUserId() userId: string,
    @Body() dto: RecordSessionDto,
  ): Promise<RecordedSessionView> {
    return this.recordSession.execute({ userId, ...dto });
  }
}
