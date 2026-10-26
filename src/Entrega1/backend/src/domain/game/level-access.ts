import { GameMode, isInfiniteMode } from './game-mode';

/**
 * Whether a player may start this level. An endless run has no level and always
 * reports zero; a level mode opens one level past the highest one cleared.
 */
export function isLevelOpen(mode: GameMode, level: number, highestCleared: number): boolean {
  if (isInfiniteMode(mode)) {
    return level === 0;
  }

  return Number.isInteger(level) && level >= 1 && level <= highestCleared + 1;
}
