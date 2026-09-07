import { palette } from './colors';

export const shadows = {
  primaryButton: {
    shadowColor: palette.orange,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  heroCard: {
    shadowColor: palette.orangeDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

export type Shadows = typeof shadows;
