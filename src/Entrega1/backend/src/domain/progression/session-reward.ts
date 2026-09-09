const CLEARED_BASE_XP = 120;
const XP_PER_LEVEL = 20;
const FAILED_SHARE = 0.25;

/**
 * How much XP a finished level is worth. This is a progression rule, so it
 * lives here and not in the app: the client reports what happened, the server
 * decides what it earns.
 */
export function xpForSession(level: number, cleared: boolean): number {
  const full = CLEARED_BASE_XP + Math.max(0, level - 1) * XP_PER_LEVEL;

  return cleared ? full : Math.round(full * FAILED_SHARE);
}
