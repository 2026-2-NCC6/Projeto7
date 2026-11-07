import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsString,
  IsUUID,
  MaxLength,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { GAME_MODES, GameMode } from '../../../domain/game/game-mode';
import { DEVICE_KINDS, DeviceKind } from '../../../domain/training-session/device-kind';
import {
  ATTEMPT_VERDICTS,
  AttemptVerdict,
  END_REASONS,
  EndReason,
  MAX_RECORDED_ATTEMPTS,
  MAX_STOP_REASON_LENGTH,
} from '../../../domain/training-session/session-context';
import { MAX_STEPS } from '../../../domain/training/training-content';
import {
  IMPACT_MAX_RAW,
  WALL_TARGET_COUNT,
} from '../../../domain/training-session/target-performance';

const MAX_LEVEL = 999;
const MAX_SCORE = 1_000_000;
const MAX_ATTEMPTS = 100_000;
const MAX_DURATION_MS = 6 * 60 * 60 * 1000;
const MAX_RESPONSE_MS = 10 * 60 * 1000;
const NOT_OPENED = 'A sessão precisa ser iniciada antes de ser registrada.';

const MAX_COUNT = 10_000;

export class TrainingRefDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(1)
  version: number;

  @IsInt()
  @Min(0)
  @Max(MAX_STEPS - 1)
  stepIndex: number;
}

export class InterruptionsDto {
  @IsInt()
  @Min(0)
  @Max(MAX_COUNT)
  pauses: number;

  @IsInt()
  @Min(0)
  @Max(MAX_COUNT)
  deviceLosses: number;

  @IsInt()
  @Min(0)
  @Max(MAX_COUNT)
  faults: number;
}

export class SessionAttemptDto {
  @IsInt()
  @Min(0)
  @Max(MAX_DURATION_MS)
  atMs: number;

  @IsInt()
  @Min(0)
  @Max(MAX_DURATION_MS)
  responseMs: number;

  @IsIn(ATTEMPT_VERDICTS)
  verdict: AttemptVerdict;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(WALL_TARGET_COUNT)
  targetId?: number | null;

  @IsInt()
  @Min(-1000)
  @Max(1000)
  scoreDelta: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(IMPACT_MAX_RAW)
  intensity?: number | null;
}

export class StartSessionDto {
  @IsIn(GAME_MODES as unknown as string[], { message: 'Modo de jogo inválido.' })
  mode: GameMode;

  // Zero is the level an endless run reports, since it has no level table.
  @IsInt()
  @Min(0)
  @Max(999)
  level: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TrainingRefDto)
  training?: TrainingRefDto;
}

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

export class SessionResultDto {
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

  @IsOptional()
  @ValidateNested()
  @Type(() => TrainingRefDto)
  training?: TrainingRefDto;

  @IsOptional()
  @IsIn(END_REASONS as unknown as string[], { message: 'Motivo de término inválido.' })
  endReason?: EndReason;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_STOP_REASON_LENGTH)
  stopReason?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => InterruptionsDto)
  interruptions?: InterruptionsDto;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  deviceId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_RECORDED_ATTEMPTS)
  @ValidateNested({ each: true })
  @Type(() => SessionAttemptDto)
  attempts?: SessionAttemptDto[];
}

export class RecordSessionDto extends SessionResultDto {
  @IsString({ message: NOT_OPENED })
  @MaxLength(2048, { message: NOT_OPENED })
  @IsNotEmpty({ message: NOT_OPENED })
  ticket: string;
}

export class RecordOfflineSessionDto extends SessionResultDto {
  @IsUUID()
  clientSessionId: string;

  @IsDateString()
  playedAt: string;
}
