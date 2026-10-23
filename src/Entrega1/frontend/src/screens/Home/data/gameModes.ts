import type { TargetColor } from '../../../types/game';

/** The 3×2 wall, lit where A1, A3 and A6 sit with their real colours. */
export const heroAccents: (TargetColor | null)[] = [
  'amber',
  null,
  'red',
  null,
  null,
  'blue',
];

export const WEEK_LENGTH = 7;
