import { useTheme } from 'styled-components/native';
import type { AchievementCategory, AchievementTier } from '../../services/profile/types';
import { Icon, type IconName } from '../Icon';
import { IconTile } from '../IconTile';

const categoryIcons: Record<AchievementCategory, IconName> = {
  level: 'medal',
  xp: 'crown',
  dailyStreak: 'flame',
  sessions: 'calendar',
  score: 'target',
  accuracy: 'crosshair',
  hitStreak: 'bolt',
  mode: 'sequence',
  rank: 'trophy',
};

interface AchievementBadgeProps {
  category: AchievementCategory;
  tier: AchievementTier;
  unlocked: boolean;
  diameter?: number;
}

export function AchievementBadge({ category, tier, unlocked, diameter }: AchievementBadgeProps) {
  const theme = useTheme();
  const size = diameter ?? theme.sizes.badge;
  const { background, foreground } = unlocked
    ? theme.colors.tier[tier]
    : { background: theme.colors.border, foreground: theme.colors.inkSoft };

  return (
    <IconTile diameter={size} background={background}>
      <Icon name={categoryIcons[category]} size={size / 2} color={foreground} />
    </IconTile>
  );
}
