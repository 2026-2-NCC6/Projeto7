import { Controller, Get, Inject, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrainingCatalog } from '../../application/use-cases/training-catalog';
import {
  CatalogTrainingDetail,
  CatalogTrainingView,
  VersionView,
} from '../../application/use-cases/training-views';
import { CatalogQueryDto, VersionQueryDto } from './dto/training-actions.dto';

@ApiTags('Catálogo de treinos')
@Controller('trainings')
export class TrainingsController {
  constructor(@Inject(TrainingCatalog) private readonly catalog: TrainingCatalog) {}

  @Get()
  list(@Query() query: CatalogQueryDto): Promise<CatalogTrainingView[]> {
    return this.catalog.list(query);
  }

  @Get(':id')
  detail(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: VersionQueryDto,
  ): Promise<CatalogTrainingDetail> {
    return this.catalog.detail(id, query.version);
  }

  @Get(':id/versions')
  versions(@Param('id', ParseUUIDPipe) id: string): Promise<VersionView[]> {
    return this.catalog.versions(id);
  }
}
