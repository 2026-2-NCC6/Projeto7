import { texts } from '../../../content/texts';
import { RANKING_CATEGORIES, type RankingCategory } from '../../../services/ranking/types';

export interface RankingCategoryDefinition {
  value: RankingCategory;
  label: string;
  description: string;
  formatValue: (value: number) => string;
}

const valueFormatters: Record<RankingCategory, (value: number) => string> = {
  xp: texts.ranks.xpValue,
  bestScore: texts.ranks.pointsValue,
  totalScore: texts.ranks.pointsValue,
  infiniteColor: texts.ranks.pointsValue,
  infiniteScore: texts.ranks.pointsValue,
  dailyStreak: texts.ranks.daysValue,
};

export const DEFAULT_RANKING_CATEGORY: RankingCategory = 'xp';

export const rankingCategories: RankingCategoryDefinition[] = RANKING_CATEGORIES.map((value) => ({
  value,
  label: texts.ranks.categories[value],
  description: texts.ranks.descriptions[value],
  formatValue: valueFormatters[value],
}));

export function rankingCategoryOf(value: RankingCategory): RankingCategoryDefinition {
  return rankingCategories.find((category) => category.value === value) ?? rankingCategories[0];
}
