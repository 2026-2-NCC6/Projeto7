import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { GAME_MODES, GameMode } from '../../../domain/game/game-mode';

const MAX_LEVEL = 999;
const MAX_SCORE = 1_000_000;
const MAX_ATTEMPTS = 100_000;
const MAX_DURATION_MS = 6 * 60 * 60 * 1000;
const MAX_RESPONSE_MS = 10 * 60 * 1000;

export class RecordSessionDto {
  @IsIn(GAME_MODES as unknown as string[], { message: 'Modo de jogo inválido.' })
  mode: GameMode;

  @IsInt()
  @Min(1)
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
}
