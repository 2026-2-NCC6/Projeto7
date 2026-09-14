export const RANKING_CATEGORIES = [
  'xp',
  'bestScore',
  'totalScore',
  'infiniteColor',
  'infiniteScore',
  'dailyStreak',
] as const;

export type RankingCategory = (typeof RANKING_CATEGORIES)[number];

export const PROFILE_RANKING_CATEGORY: RankingCategory = 'xp';

export function isRankingCategory(value: string): value is RankingCategory {
  return (RANKING_CATEGORIES as readonly string[]).includes(value);
}
