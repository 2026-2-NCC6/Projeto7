import { Colors, darkColors, lightColors } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';
import { sizes } from './sizes';
import { spacing } from './spacing';
import { typography } from './typography';

export type ThemeMode = 'light' | 'dark';

export type ThemePreference = ThemeMode | 'system';

export interface AppTheme {
  mode: ThemeMode;
  colors: Colors;
  spacing: typeof spacing;
  radii: typeof radii;
  sizes: typeof sizes;
  typography: typeof typography;
  shadows: typeof shadows;
}

function buildTheme(mode: ThemeMode, colors: Colors): AppTheme {
  return { mode, colors, spacing, radii, sizes, typography, shadows };
}

export const themes: Record<ThemeMode, AppTheme> = {
  light: buildTheme('light', lightColors),
  dark: buildTheme('dark', darkColors),
};

export { darkColors, lightColors, radii, shadows, sizes, spacing, typography };
export type { ColorPair, Colors } from './colors';
export { fontAssets } from './typography';
export type { FontSizeToken, FontWeightToken, LineHeightToken } from './typography';
