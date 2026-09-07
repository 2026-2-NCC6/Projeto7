import {
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

export const fontAssets = {
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
};

export const fontFamily = {
  medium: 'Manrope_500Medium',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
} as const;

export const fontSize = {
  '2xs': 10.5,
  xs: 11,
  sm: 12,
  smPlus: 12.5,
  base: 13,
  md: 14,
  mdPlus: 14.5,
  lg: 15,
  xl: 16,
  '2xl': 19,
  '3xl': 20,
  '4xl': 22,
  '5xl': 30,
} as const;

export const lineHeightRatio = {
  tight: 1.15,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.5,
} as const;

export const letterSpacing = {
  none: 0,
  wide: 0.5,
  wider: 1,
} as const;

export const typography = {
  fontFamily,
  fontSize,
  lineHeightRatio,
  letterSpacing,
} as const;

export type Typography = typeof typography;
export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontFamily;
export type LineHeightToken = keyof typeof lineHeightRatio;
