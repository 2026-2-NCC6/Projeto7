import { texts } from '../../../../content/texts';
import type { RankingCategory } from '../../../../services/ranking/types';
import { rankingCategoryOf } from '../../data/rankingCategories';
import { CategoryChips } from '../CategoryChips';
import { Description, Subtitle, Title } from './styles';

interface RanksHeaderProps {
  category: RankingCategory;
  total: number | null;
  onSelectCategory: (category: RankingCategory) => void;
}

export function RanksHeader({ category, total, onSelectCategory }: RanksHeaderProps) {
  return (
    <>
      <Title accessibilityRole="header">{texts.ranks.title}</Title>
      <Subtitle>{total === null ? ' ' : texts.ranks.playersCount(total)}</Subtitle>
      <CategoryChips selected={category} onSelect={onSelectCategory} />
      <Description>{rankingCategoryOf(category).description}</Description>
    </>
  );
}
