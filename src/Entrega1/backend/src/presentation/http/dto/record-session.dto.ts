import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { GAME_MODES, GameMode } from '../../../domain/game/game-mode';
import { DEVICE_KINDS, DeviceKind } from '../../../domain/training-session/device-kind';
import {
  IMPACT_MAX_RAW,
  WALL_TARGET_COUNT,
} from '../../../domain/training-session/target-performance';

const MAX_LEVEL = 999;
const MAX_SCORE = 1_000_000;
const MAX_ATTEMPTS = 100_000;
const MAX_DURATION_MS = 6 * 60 * 60 * 1000;
const MAX_RESPONSE_MS = 10 * 60 * 1000;

export class TargetPerformanceDto {
  @IsInt()
  @Min(1)
  @Max(WALL_TARGET_COUNT)
  targetId: number;

  @IsInt()
  @Min(0)
  @Max(MAX_ATTEMPTS)
  attempts: number;

  @IsInt()
  @Min(0)
  @Max(MAX_ATTEMPTS)
  correctHits: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(IMPACT_MAX_RAW)
  impactAverage?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(IMPACT_MAX_RAW)
  impactPeak?: number | null;
}

export class RecordSessionDto {
  @IsIn(GAME_MODES as unknown as string[], { message: 'Modo de jogo inválido.' })
  mode: GameMode;

  // Zero is the level an endless run reports, since it has no level table.
  @IsInt()
  @Min(0)
  @Max(MAX_LEVEL)
  level: number;

  @IsBoolean()
  cleared: boolean;

  @IsInt()
  @Min(0)
  @Max(MAX_SCORE)
  score: number;

  @IsInt()
  @Min(0)
  @Max(MAX_ATTEMPTS)
  hits: number;

  @IsInt()
  @Min(0)
  @Max(MAX_ATTEMPTS)
  misses: number;

  @IsInt()
  @Min(0)
  @Max(MAX_ATTEMPTS)
  bestStreak: number;

  @IsInt()
  @Min(0)
  @Max(MAX_DURATION_MS)
  durationMs: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_RESPONSE_MS)
  avgResponseMs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_RESPONSE_MS)
  bestResponseMs?: number;

  @IsOptional()
  @IsIn(DEVICE_KINDS as unknown as string[], { message: 'Tipo de dispositivo inválido.' })
  deviceKind?: DeviceKind;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(WALL_TARGET_COUNT)
  @ArrayUnique((target: TargetPerformanceDto) => target.targetId)
  @ValidateNested({ each: true })
  @Type(() => TargetPerformanceDto)
  targets?: TargetPerformanceDto[];
}
