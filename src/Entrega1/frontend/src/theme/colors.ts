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
  silver: '#c2c4c8',
  bronze: '#b78e77',
  white: '#ffffff',

  obsidian: '#0d1013',
  graphite: '#161a1f',
  onyx: '#1e232a',
  steel: '#2b313a',
  mist: '#f2f1ef',
  fog: '#9aa2ad',
  ember: '#3a2113',
  amber: '#ff9552',
  coral: '#ff6b6e',
} as const;

export interface TierColor {
  background: string;
  foreground: string;
}

export interface Colors {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;

  ink: string;
  inkSoft: string;
  onPrimary: string;
  onInk: string;

  primary: string;
  primaryDark: string;
  primarySoft: string;

  danger: string;

  target: {
    yellow: string;
    blue: string;
    red: string;
  };

  tier: {
    bronze: TierColor;
    silver: TierColor;
    gold: TierColor;
    legend: TierColor;
  };

  translucentLight: string;
}

const tier: Colors['tier'] = {
  bronze: { background: palette.bronze, foreground: palette.charcoal },
  silver: { background: palette.silver, foreground: palette.charcoal },
  gold: { background: palette.yellow, foreground: palette.charcoal },
  legend: { background: palette.orange, foreground: palette.white },
};

const shared = {
  target: {
    yellow: palette.yellow,
    blue: palette.blue,
    red: palette.red,
  },
  tier,
  translucentLight: 'rgba(255, 255, 255, 0.35)',
};

export const lightColors: Colors = {
  ...shared,

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
};

export const darkColors: Colors = {
  ...shared,

  background: palette.obsidian,
  surface: palette.graphite,
  surfaceRaised: palette.onyx,
  border: palette.steel,

  ink: palette.mist,
  inkSoft: palette.fog,
  onPrimary: palette.white,
  onInk: palette.obsidian,

  primary: palette.orange,
  primaryDark: palette.amber,
  primarySoft: palette.ember,

  danger: palette.coral,
};
