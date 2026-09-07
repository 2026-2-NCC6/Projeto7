import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Card } from '../../../components/Card';
import { Icon } from '../../../components/Icon';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';
import type { DailyChallengeStatus } from '../../../services/home/types';
import { WEEK_LENGTH } from '../data/gameModes';

const Container = styled(Card)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['2xl']}px;
  padding: ${({ theme }) => theme.spacing['3xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
  border-width: ${({ theme }) => theme.sizes.inputBorder}px;
  border-color: ${({ theme }) => theme.colors.primarySoft};
`;

const Badge = styled.View<{ active: boolean }>`
  width: ${({ theme }) => theme.sizes.badge}px;
  height: ${({ theme }) => theme.sizes.badge}px;
  border-radius: ${({ theme }) => theme.radii.xl}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primarySoft : theme.colors.border};
`;

const Details = styled.View`
  flex: 1;
`;

const Title = styled(Text).attrs({ size: 'mdPlus', weight: 'extraBold' })``;

const Subtitle = styled(Text).attrs({ size: 'sm', weight: 'bold', tone: 'inkSoft' })``;

const WeekDots = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Dot = styled.View<{ filled: boolean }>`
  width: ${({ theme }) => theme.sizes.dot}px;
  height: ${({ theme }) => theme.sizes.dot}px;
  border-radius: ${({ theme }) => theme.sizes.dot / 2}px;
  background-color: ${({ theme, filled }) => (filled ? theme.colors.primary : theme.colors.border)};
`;

function filledDots(streak: number): number {
  const remainder = streak % WEEK_LENGTH;
  return remainder === 0 && streak > 0 ? WEEK_LENGTH : remainder;
}

interface DailyChallengeCardProps {
  challenge: DailyChallengeStatus;
  onPress: () => void;
}

export function DailyChallengeCard({ challenge, onPress }: DailyChallengeCardProps) {
  const theme = useTheme();
  const active = challenge.currentStreak > 0;
  const filled = filledDots(challenge.currentStreak);
  const status = challenge.completedToday ? texts.home.dailyDone : texts.home.dailyPending;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Container>
        <Badge active={active}>
          <Icon
            name="flame"
            filled={active}
            color={active ? theme.colors.primaryDark : theme.colors.inkSoft}
          />
        </Badge>
        <Details>
          <Title>{texts.home.dailyChallenge}</Title>
          <Subtitle>
            {texts.home.dailyStreak(challenge.currentStreak)} · {status}
          </Subtitle>
        </Details>
        <WeekDots>
          {Array.from({ length: WEEK_LENGTH }, (_, index) => (
            <Dot key={index} filled={index < filled} />
          ))}
        </WeekDots>
      </Container>
    </Pressable>
  );
}
