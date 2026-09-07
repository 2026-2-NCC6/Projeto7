import styled from 'styled-components/native';
import { StatCard } from '../../../components/StatCard';
import { texts } from '../../../content/texts';
import type { SessionStats } from '../../../services/home/types';

const Grid = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing['7xl']}px;
`;

function compact(value: number): string {
  return value >= 1000
    ? `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}K`
    : String(value);
}

interface QuickStatsProps {
  stats: SessionStats;
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <Grid>
      <StatCard value={String(stats.totalSessions)} label={texts.home.sessions} />
      <StatCard value={String(stats.bestStreak)} label={texts.home.bestStreak} />
      <StatCard value={compact(stats.totalScore)} label={texts.home.totalScore} />
    </Grid>
  );
}
