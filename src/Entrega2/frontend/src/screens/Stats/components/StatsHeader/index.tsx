import { formatMonthYear } from '../../../../content/formatters';
import { texts } from '../../../../content/texts';
import type { PlayerStatistics } from '../../../../services/statistics/types';
import { Subtitle, Title } from './styles';

interface StatsHeaderProps {
  player: PlayerStatistics['player'] | null;
}

export function StatsHeader({ player }: StatsHeaderProps) {
  return (
    <>
      <Title accessibilityRole="header">{texts.stats.title}</Title>
      <Subtitle numberOfLines={2}>
        {player
          ? texts.stats.subtitle(player.level, formatMonthYear(player.memberSince))
          : texts.stats.guestSubtitle}
      </Subtitle>
    </>
  );
}
