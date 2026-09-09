import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '../../../components/Avatar';
import { Icon } from '../../../components/Icon';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

const Titles = styled.View``;

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const StreakPill = styled.View<{ active: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.xl - 1}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primarySoft : theme.colors.surface};
`;

const Greeting = styled(Text).attrs({ size: 'base', weight: 'bold', tone: 'inkSoft' })``;

const Name = styled(Text).attrs({ size: '4xl', weight: 'extraBold' })``;

const StreakValue = styled(Text).attrs<{ active: boolean }>(({ active }) => ({
  size: 'base' as const,
  weight: 'extraBold' as const,
  tone: active ? ('primaryDark' as const) : ('inkSoft' as const),
}))<{ active: boolean }>``;

function firstNameOf(fullName: string): string {
  return fullName.trim().split(' ')[0];
}

interface HomeHeaderProps {
  greeting: string;
  name: string;
  dailyStreak: number;
  onOpenAccountMenu: () => void;
}

export function HomeHeader({
  greeting,
  name,
  dailyStreak,
  onOpenAccountMenu,
}: HomeHeaderProps) {
  const theme = useTheme();
  const active = dailyStreak > 0;

  return (
    <Row>
      <Titles>
        <Greeting>{greeting}</Greeting>
        <Name>
          {texts.home.salutation}
          {firstNameOf(name)}
        </Name>
      </Titles>
      <Actions>
        <StreakPill active={active}>
          <Icon
            name="flame"
            filled={active}
            size={theme.sizes.icon - 4}
            color={active ? theme.colors.primaryDark : theme.colors.inkSoft}
          />
          <StreakValue active={active}>{dailyStreak}</StreakValue>
        </StreakPill>
        <Pressable
          onPress={onOpenAccountMenu}
          accessibilityRole="button"
          accessibilityLabel={texts.home.accountMenu}
        >
          <Avatar name={name} />
        </Pressable>
      </Actions>
    </Row>
  );
}
