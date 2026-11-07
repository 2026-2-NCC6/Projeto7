export const radii = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
  xl: 13,
  '2xl': 14,
  '3xl': 16,
  '4xl': 18,
  '5xl': 20,
  '6xl': 24,
  pill: 100,
} as const;

export type Radii = typeof radii;
