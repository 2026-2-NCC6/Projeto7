import { colors } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';
import { sizes } from './sizes';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  radii,
  sizes,
  typography,
  shadows,
} as const;

export type AppTheme = typeof theme;

export { colors, radii, shadows, sizes, spacing, typography };
export { fontAssets } from './typography';
export type { FontSizeToken, FontWeightToken, LineHeightToken } from './typography';
