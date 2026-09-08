import type { GameModeId } from '../../../types/game';

export type ModeAccent = 'primary' | 'blue' | 'red' | 'ink';

export interface GameMode {
  id: GameModeId;
  tag: string;
  accent: ModeAccent;
}

export const gameModes: GameMode[] = [
  { id: 'level_color', tag: 'Acerte a sequência de cores', accent: 'primary' },
  { id: 'level_score', tag: 'Some pontos por alvo', accent: 'blue' },
  { id: 'infinite_color', tag: 'Cores sem fim, até você errar', accent: 'red' },
  { id: 'infinite_score', tag: 'Pontos sem fim, contra o relógio', accent: 'ink' },
];

export const heroAccents: (('yellow' | 'blue' | 'red') | null)[] = [
  'yellow',
  null,
  null,
  null,
  'red',
  null,
  null,
  null,
  'blue',
];

export const WEEK_LENGTH = 7;
