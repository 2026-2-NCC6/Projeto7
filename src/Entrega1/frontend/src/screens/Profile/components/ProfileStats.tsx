import styled from 'styled-components/native';
import { StatCard } from '../../../components/StatCard';
import { texts } from '../../../content/texts';
import type { ProfileStats as ProfileStatsData } from '../../../services/profile/types';

const Grid = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

interface ProfileStatsProps {
  stats: ProfileStatsData;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <Grid>
      <StatCard value={String(stats.totalSessions)} label={texts.profile.sessions} />
      <StatCard
        value={
          stats.accuracyPercent === null
            ? texts.profile.empty
            : texts.profile.percentValue(stats.accuracyPercent)
        }
        label={texts.profile.accuracy}
      />
      <StatCard value={String(stats.bestStreak)} label={texts.profile.bestStreak} />
    </Grid>
  );
}
