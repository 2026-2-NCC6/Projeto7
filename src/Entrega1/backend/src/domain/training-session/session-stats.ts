export interface SessionStats {
  totalSessions: number;
  bestStreak: number;
  totalScore: number;
}

export const EMPTY_SESSION_STATS: SessionStats = {
  totalSessions: 0,
  bestStreak: 0,
  totalScore: 0,
};
