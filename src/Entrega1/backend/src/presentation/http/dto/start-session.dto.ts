import { IsIn, IsInt, Max, Min } from 'class-validator';
import { GAME_MODES, GameMode } from '../../../domain/game/game-mode';

export class StartSessionDto {
  @IsIn(GAME_MODES as unknown as string[], { message: 'Modo de jogo inválido.' })
  mode: GameMode;

  // Zero is the level an endless run reports, since it has no level table.
  @IsInt()
  @Min(0)
  @Max(999)
  level: number;
}
