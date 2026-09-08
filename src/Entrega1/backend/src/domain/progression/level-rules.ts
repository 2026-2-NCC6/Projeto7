const BASE_XP = 500;
const XP_PER_LEVEL = 250;

export function xpRequiredForLevel(level: number): number {
  return BASE_XP + level * XP_PER_LEVEL;
}

export function totalXpUpToLevel(level: number): number {
  return BASE_XP * level + (XP_PER_LEVEL * level * (level - 1)) / 2;
}
