import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  StudioDetailView,
  TrainingAnalyticsView,
  TrainingStudio,
} from '../../application/use-cases/training-studio';
import { StudioTrainingView } from '../../application/use-cases/training-views';
import { CurrentUserId } from './current-user-id.decorator';
import {
  PublishDto,
  ReturnToDraftDto,
  SimulationDto,
  StudioQueryDto,
} from './dto/training-actions.dto';
import { toTrainingContent, TrainingContentDto } from './dto/training-content.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Estúdio de treinos')
@ApiBearerAuth()
@Controller('studio/trainings')
@UseGuards(JwtAuthGuard)
export class StudioController {
  constructor(@Inject(TrainingStudio) private readonly studio: TrainingStudio) {}

  @Get()
  list(@CurrentUserId() userId: string, @Query() query: StudioQueryDto): Promise<StudioTrainingView[]> {
    return this.studio.list(userId, query.status);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUserId() userId: string, @Body() dto: TrainingContentDto): Promise<StudioDetailView> {
    return this.studio.create(userId, toTrainingContent(dto));
  }

  @Get(':id')
  detail(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudioDetailView> {
    return this.studio.detail(userId, id);
  }

  @Put(':id')
  update(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TrainingContentDto,
  ): Promise<StudioDetailView> {
    return this.studio.update(userId, id, toTrainingContent(dto));
  }

  @Post(':id/simulation')
  @HttpCode(HttpStatus.OK)
  simulate(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SimulationDto,
  ): Promise<StudioDetailView> {
    return this.studio.simulate(userId, id, dto.revision, dto.passed);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudioDetailView> {
    return this.studio.submit(userId, id);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishDto,
  ): Promise<StudioDetailView> {
    return this.studio.publish(userId, id, dto.changeNote);
  }

  @Post(':id/return')
  @HttpCode(HttpStatus.OK)
  returnToDraft(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReturnToDraftDto,
  ): Promise<StudioDetailView> {
    return this.studio.returnToDraft(userId, id, dto.note);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudioDetailView> {
    return this.studio.archive(userId, id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  restore(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudioDetailView> {
    return this.studio.restore(userId, id);
  }

  @Get(':id/analytics')
  analytics(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TrainingAnalyticsView> {
    return this.studio.analytics(userId, id);
  }
}
