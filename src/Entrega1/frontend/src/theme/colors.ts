import type { TargetColor } from '../types/game';

export const palette = {
  bone: '#fcfaf7',
  linen: '#f7f5f1',
  ash: '#e4e1dd',
  charcoal: '#0f1216',
  slate: '#5a5e65',
  lime: '#c3f53c',
  limeDeep: '#4a7000',
  limeMid: '#8fd400',
  limeBright: '#d6ff5c',
  limeSoft: '#edfbc6',
  moss: '#1e2b0a',
  red: '#ea3c3f',
  blue: '#0077cd',
  amber: '#f2a516',
  silver: '#c2c4c8',
  bronze: '#b78e77',
  white: '#ffffff',

  obsidian: '#0d1013',
  graphite: '#161a1f',
  onyx: '#1e232a',
  steel: '#2b313a',
  mist: '#f2f1ef',
  fog: '#9aa2ad',
  coral: '#ff6b6e',
} as const;

export interface ColorPair {
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
  heroGradient: readonly [string, string];

  danger: string;

  target: Record<TargetColor, ColorPair>;

  tier: {
    bronze: ColorPair;
    silver: ColorPair;
    gold: ColorPair;
    legend: ColorPair;
  };

  translucentLight: string;
  translucentDark: string;
}

const tier: Colors['tier'] = {
  bronze: { background: palette.bronze, foreground: palette.charcoal },
  silver: { background: palette.silver, foreground: palette.charcoal },
  gold: { background: palette.amber, foreground: palette.charcoal },
  legend: { background: palette.lime, foreground: palette.charcoal },
};

const target: Colors['target'] = {
  amber: { background: palette.amber, foreground: palette.charcoal },
  blue: { background: palette.blue, foreground: palette.white },
  red: { background: palette.red, foreground: palette.white },
};

const shared = {
  target,
  tier,
  translucentLight: 'rgba(255, 255, 255, 0.35)',
  translucentDark: 'rgba(15, 18, 22, 0.28)',
};

export const lightColors: Colors = {
  ...shared,

  background: palette.bone,
  surface: palette.linen,
  surfaceRaised: palette.white,
  border: palette.ash,

  ink: palette.charcoal,
  inkSoft: palette.slate,
  onPrimary: palette.charcoal,
  onInk: palette.white,

  primary: palette.lime,
  primaryDark: palette.limeDeep,
  primarySoft: palette.limeSoft,
  heroGradient: [palette.lime, palette.limeMid],

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
  onPrimary: palette.charcoal,
  onInk: palette.obsidian,

  primary: palette.lime,
  primaryDark: palette.limeBright,
  primarySoft: palette.moss,
  heroGradient: [palette.limeMid, palette.lime],

  danger: palette.coral,
};
