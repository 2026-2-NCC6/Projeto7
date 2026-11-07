import styled, { useTheme } from 'styled-components/native';
import { AchievementBadge } from '../../../components/AchievementBadge';
import { Card } from '../../../components/Card';
import { ProgressFill, ProgressTrack } from '../../../components/ProgressBar';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';
import type { Achievement } from '../../../services/profile/types';

const COLUMN_WIDTH = '48%';
const LOCKED_OPACITY = 0.72;
const DESCRIPTION_HEIGHT = 30;

const Container = styled(Card)<{ unlocked: boolean }>`
  width: ${COLUMN_WIDTH};
  padding: ${({ theme }) => theme.spacing['3xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  opacity: ${({ unlocked }) => (unlocked ? 1 : LOCKED_OPACITY)};
`;

const Title = styled(Text).attrs({ size: 'base', weight: 'extraBold' })`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const Description = styled(Text).attrs({
  size: 'xs',
  tone: 'inkSoft',
  leading: 'normal',
})`
  min-height: ${DESCRIPTION_HEIGHT}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const theme = useTheme();
  const copy = texts.achievements.items[achievement.id];

  return (
    <Container unlocked={achievement.unlocked}>
      <AchievementBadge
        category={achievement.category}
        tier={achievement.tier}
        unlocked={achievement.unlocked}
      />
      <Title>{copy.title}</Title>
      <Description>{copy.description}</Description>
      {achievement.unlocked || achievement.progress === null ? null : (
        <ProgressTrack height={theme.sizes.progressBarSmall}>
          <ProgressFill percentage={achievement.progress} />
        </ProgressTrack>
      )}
    </Container>
  );
}
