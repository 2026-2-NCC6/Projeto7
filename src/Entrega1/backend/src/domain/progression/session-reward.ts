import { GameMode, isInfiniteMode } from '../game/game-mode';

const CLEARED_BASE_XP = 120;
const XP_PER_LEVEL = 20;
const FAILED_SHARE = 0.25;

const INFINITE_BASE_XP = 40;
const INFINITE_XP_PER_POINT = 0.2;
/** Keeps the level ladder the better source of XP, and a tampered score harmless. */
const INFINITE_MAX_XP = 400;

export interface SessionReward {
  mode: GameMode;
  level: number;
  cleared: boolean;
  score: number;
}

/**
 * How much XP a finished session is worth. This is a progression rule, so it
 * lives here and not in the app: the client reports what happened, the server
 * decides what it earns.
 *
 * An endless run has no level and never clears, so it is paid for the score it
 * reached instead of the level it finished.
 */
export function xpForSession({ mode, level, cleared, score }: SessionReward): number {
  if (isInfiniteMode(mode)) {
    const earned = INFINITE_BASE_XP + Math.round(Math.max(0, score) * INFINITE_XP_PER_POINT);

    return Math.min(INFINITE_MAX_XP, earned);
  }

  const full = CLEARED_BASE_XP + Math.max(0, level - 1) * XP_PER_LEVEL;

  return cleared ? full : Math.round(full * FAILED_SHARE);
}
