import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import {
  AUDIENCES,
  Audience,
  DIFFICULTIES,
  Difficulty,
  OBJECTIVES,
  Objective,
  TARGET_COLORS,
  TargetColor,
} from '../../../domain/training/training-content';
import { TRAINING_STATUSES, TrainingStatus } from '../../../domain/training/training.entity';

export class SimulationDto {
  @IsInt()
  @Min(1)
  revision: number;

  @IsBoolean()
  passed: boolean;
}

export class PublishDto {
  @IsString()
  @MaxLength(280)
  changeNote: string;
}

export class ReturnToDraftDto {
  @IsString()
  @MaxLength(280)
  note: string;
}

export class StudioQueryDto {
  @IsOptional()
  @IsIn(TRAINING_STATUSES)
  status?: TrainingStatus;
}

export class CatalogQueryDto {
  @IsOptional()
  @IsIn(AUDIENCES)
  audience?: Audience;

  @IsOptional()
  @IsIn(OBJECTIVES)
  objective?: Objective;

  @IsOptional()
  @IsIn(DIFFICULTIES)
  difficulty?: Difficulty;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  maxMinutes?: number;

  @IsOptional()
  @IsIn(TARGET_COLORS)
  color?: TargetColor;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;
}

export class VersionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}
