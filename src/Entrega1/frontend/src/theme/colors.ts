export const palette = {
  bone: '#fcfaf7',
  linen: '#f7f5f1',
  ash: '#e4e1dd',
  charcoal: '#0f1216',
  slate: '#5a5e65',
  orange: '#fa6e1d',
  orangeDark: '#cf4500',
  orangeSoft: '#ffe8d6',
  red: '#ea3c3f',
  blue: '#0077cd',
  yellow: '#e6c540',
  white: '#ffffff',
} as const;

export const colors = {
  background: palette.bone,
  surface: palette.linen,
  surfaceRaised: palette.white,
  border: palette.ash,

  ink: palette.charcoal,
  inkSoft: palette.slate,
  onPrimary: palette.white,
  onInk: palette.white,

  primary: palette.orange,
  primaryDark: palette.orangeDark,
  primarySoft: palette.orangeSoft,

  danger: palette.red,

  target: {
    yellow: palette.yellow,
    blue: palette.blue,
    red: palette.red,
  },

  translucentLight: 'rgba(255, 255, 255, 0.35)',
} as const;

export type Colors = typeof colors;
