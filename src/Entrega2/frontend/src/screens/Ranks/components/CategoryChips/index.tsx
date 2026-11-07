import { PillToggle } from '../../../../components/PillToggle';
import type { RankingCategory } from '../../../../services/ranking/types';
import { rankingCategories } from '../../data/rankingCategories';
import { Scroller } from './styles';

const options = rankingCategories.map(({ value, label }) => ({ value, label }));

interface CategoryChipsProps {
  selected: RankingCategory;
  onSelect: (category: RankingCategory) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <Scroller>
      <PillToggle options={options} selected={selected} onSelect={onSelect} />
    </Scroller>
  );
}
