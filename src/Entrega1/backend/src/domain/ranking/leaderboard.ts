export const LEADERBOARD_SIZE = 50;

export interface LeaderboardEntry {
  position: number;
  userId: string;
  name: string;
  value: number;
}

export interface Standings {
  entries: LeaderboardEntry[];
  total: number;
}
