import { PillToggle, type PillOption } from '../../../components/PillToggle';
import { texts } from '../../../content/texts';
import type { Achievement } from '../../../services/profile/types';

export type AchievementFilter = 'all' | 'unlocked' | 'locked';

const filters: PillOption<AchievementFilter>[] = [
  { value: 'all', label: texts.achievements.filterAll },
  { value: 'unlocked', label: texts.achievements.filterUnlocked },
  { value: 'locked', label: texts.achievements.filterLocked },
];

export function applyFilter(
  achievements: Achievement[],
  filter: AchievementFilter,
): Achievement[] {
  if (filter === 'all') {
    return achievements;
  }

  return achievements.filter((achievement) => achievement.unlocked === (filter === 'unlocked'));
}

interface AchievementFiltersProps {
  selected: AchievementFilter;
  onSelect: (filter: AchievementFilter) => void;
}

export function AchievementFilters({ selected, onSelect }: AchievementFiltersProps) {
  return <PillToggle options={filters} selected={selected} onSelect={onSelect} />;
}
