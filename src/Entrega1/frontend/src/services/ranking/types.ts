export const RANKING_CATEGORIES = [
  'xp',
  'bestScore',
  'totalScore',
  'infiniteColor',
  'infiniteScore',
  'dailyStreak',
] as const;

export type RankingCategory = (typeof RANKING_CATEGORIES)[number];

export interface RankedPlayer {
  position: number;
  name: string;
  value: number;
  isViewer: boolean;
}

export interface Leaderboard {
  category: RankingCategory;
  total: number;
  entries: RankedPlayer[];
  viewer: RankedPlayer | null;
}
