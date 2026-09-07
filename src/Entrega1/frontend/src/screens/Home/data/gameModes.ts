import type { IconName } from '../../../components/Icon';
import type { ProgressionTrack } from '../../../services/home/types';

export type ModeAccent = 'primary' | 'blue' | 'red' | 'ink';

export type GameModeId =
  | 'level_color'
  | 'level_score'
  | 'infinite_color'
  | 'infinite_score';

export interface GameMode {
  id: GameModeId;
  icon: IconName;
  name: string;
  tag: string;
  accent: ModeAccent;
}

export const gameModes: GameMode[] = [
  {
    id: 'level_color',
    icon: 'sequence',
    name: 'Level Color Mode',
    tag: 'Acerte a sequência de cores',
    accent: 'primary',
  },
  {
    id: 'level_score',
    icon: 'target',
    name: 'Level Score Mode',
    tag: 'Some pontos por alvo',
    accent: 'blue',
  },
  {
    id: 'infinite_color',
    icon: 'infinite',
    name: 'Infinite Color Mode',
    tag: 'Cores sem fim, até você errar',
    accent: 'red',
  },
  {
    id: 'infinite_score',
    icon: 'timer',
    name: 'Infinite Score Mode',
    tag: 'Pontos sem fim, contra o relógio',
    accent: 'ink',
  },
];

export const trackLabels: Record<ProgressionTrack, string> = {
  color: 'Color',
  score: 'Score',
};

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
