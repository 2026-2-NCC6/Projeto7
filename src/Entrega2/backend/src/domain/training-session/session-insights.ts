import { GAME_MODES, GameMode } from '../game/game-mode';

export interface SessionRecords {
  bestScore: number | null;
  fastestLevelMs: number | null;
  longestHitStreak: number | null;
}

export interface SessionInsights {
  accuracyPercent: number | null;
  records: SessionRecords;
  sessionsByMode: Record<GameMode, number>;
  highestClearedByMode: Record<GameMode, number>;
}

export const EMPTY_SESSION_INSIGHTS: SessionInsights = {
  accuracyPercent: null,
  records: { bestScore: null, fastestLevelMs: null, longestHitStreak: null },
  sessionsByMode: { level_color: 0, level_score: 0, infinite_color: 0, infinite_score: 0 },
  highestClearedByMode: { level_color: 0, level_score: 0, infinite_color: 0, infinite_score: 0 },
};

export function favoriteModeOf(sessionsByMode: Record<GameMode, number>): GameMode | null {
  const favorite = GAME_MODES.reduce((best, mode) =>
    sessionsByMode[mode] > sessionsByMode[best] ? mode : best,
  );

  return sessionsByMode[favorite] === 0 ? null : favorite;
}
