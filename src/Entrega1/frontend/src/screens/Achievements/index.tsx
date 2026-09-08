import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ProgressFill, ProgressTrack } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { Triangle } from '../../components/Triangle';
import { texts } from '../../content/texts';
import type { Achievement } from '../../services/profile/types';
import { AchievementCard } from './components/AchievementCard';
import {
  AchievementFilters,
  applyFilter,
  type AchievementFilter,
} from './components/AchievementFilters';
import {
  BackLabel,
  BackRow,
  Content,
  Counter,
  Diamond,
  EmptyMessage,
  Filters,
  Grid,
  Overall,
  Title,
  TitleRow,
} from './styles';

const PERCENT = 100;
const CHEVRON = { length: 7, half: 5 } as const;

interface AchievementsScreenProps {
  achievements: Achievement[];
  onGoBack: () => void;
}

export function AchievementsScreen({ achievements, onGoBack }: AchievementsScreenProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<AchievementFilter>('all');

  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  const unlockedPercent = Math.round((unlocked / achievements.length) * PERCENT);
  const visible = applyFilter(achievements, filter);

  return (
    <Screen edges={['top']}>
      <Content>
        <Pressable onPress={onGoBack} accessibilityRole="button">
          <BackRow>
            <Triangle direction="left" {...CHEVRON} color={theme.colors.inkSoft} />
            <BackLabel>{texts.tabs.profile}</BackLabel>
          </BackRow>
        </Pressable>

        <TitleRow>
          <Diamond />
          <Title>{texts.achievements.title}</Title>
        </TitleRow>
        <Counter>{texts.achievements.unlockedCount(unlocked, achievements.length)}</Counter>

        <Overall>
          <ProgressTrack>
            <ProgressFill percentage={unlockedPercent} />
          </ProgressTrack>
        </Overall>

        <Filters>
          <AchievementFilters selected={filter} onSelect={setFilter} />
        </Filters>

        {visible.length === 0 ? (
          <EmptyMessage>{texts.achievements.emptyList}</EmptyMessage>
        ) : (
          <Grid>
            {visible.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </Grid>
        )}
      </Content>
    </Screen>
  );
}
