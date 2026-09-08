import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { AchievementBadge } from '../../../components/AchievementBadge';
import { Diamond } from '../../../components/Diamond';
import { SectionTitle } from '../../../components/SectionTitle';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';
import type { Achievement } from '../../../services/profile/types';

const PREVIEW_LENGTH = 4;
const LOCKED_OPACITY = 0.6;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const Title = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Label = styled(SectionTitle)`
  margin-bottom: 0px;
`;

const SeeAll = styled(Text).attrs({ size: 'base', weight: 'extraBold', tone: 'primary' })``;

const Strip = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing['7xl']}px;
`;

const Slot = styled.View<{ unlocked: boolean }>`
  opacity: ${({ unlocked }) => (unlocked ? 1 : LOCKED_OPACITY)};
`;

function previewOf(achievements: Achievement[]): Achievement[] {
  return [...achievements]
    .sort((first, second) => Number(second.unlocked) - Number(first.unlocked))
    .slice(0, PREVIEW_LENGTH);
}

interface AchievementStripProps {
  achievements: Achievement[];
  onSeeAll: () => void;
}

export function AchievementStrip({ achievements, onSeeAll }: AchievementStripProps) {
  const theme = useTheme();

  return (
    <>
      <Header>
        <Title>
          <Diamond />
          <Label>{texts.profile.achievements}</Label>
        </Title>
        <Pressable onPress={onSeeAll} accessibilityRole="button">
          <SeeAll>{texts.profile.seeAll}</SeeAll>
        </Pressable>
      </Header>
      <Strip>
        {previewOf(achievements).map((achievement) => (
          <Slot key={achievement.id} unlocked={achievement.unlocked}>
            <AchievementBadge
              category={achievement.category}
              tier={achievement.tier}
              unlocked={achievement.unlocked}
              diameter={theme.sizes.badgeLarge}
            />
          </Slot>
        ))}
      </Strip>
    </>
  );
}
