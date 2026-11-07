import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Screen } from '../../components/Screen';
import { greetingFor } from '../../content/greeting';
import { texts } from '../../content/texts';
import { isPlayable, modeCatalog } from '../../gameplay/modes/mode-catalog';
import { useHomeOverview } from '../../hooks/useHomeOverview';
import { useLevelProgressStore } from '../../gameplay/store/levelProgressStore';
import { useAuthStore } from '../../store/authStore';
import type { PlayableModeId } from '../../types/game';
import { AccountMenu } from './components/AccountMenu';
import { DailyChallengeCard } from './components/DailyChallengeCard';
import { GameModeList } from './components/GameModeList';
import { HeroCard } from './components/HeroCard';
import { HomeHeader } from './components/HomeHeader';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { QuickStats } from './components/QuickStats';
import { Centered, Content, ErrorMessage, RetryLabel, Section } from './styles';

interface HomeScreenProps {
  onViewProfile: () => void;
  onOpenPlay: () => void;
  onSelectMode: (mode: PlayableModeId) => void;
}

export function HomeScreen({ onViewProfile, onOpenPlay, onSelectMode }: HomeScreenProps) {
  const theme = useTheme();
  const accessToken = useAuthStore((state) => state.accessToken);
  const signOut = useAuthStore((state) => state.signOut);
  const { overview, loading, error, reload } = useHomeOverview();
  const syncHighestCleared = useLevelProgressStore((state) => state.syncHighestCleared);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);

  const closeAccountMenu = () => setAccountMenuVisible(false);

  useEffect(() => {
    if (overview && accessToken) {
      syncHighestCleared(overview.highestClearedByMode);
    }
  }, [overview, accessToken, syncHighestCleared]);

  if (loading) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <ActivityIndicator color={theme.colors.primaryDark} size="large" />
        </Centered>
      </Screen>
    );
  }

  if (error || !overview) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <ErrorMessage>{error ?? texts.home.loadError}</ErrorMessage>
          <Pressable onPress={reload} accessibilityRole="button">
            <RetryLabel>{texts.home.retry}</RetryLabel>
          </Pressable>
        </Centered>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <Content>
        <HomeHeader
          greeting={greetingFor()}
          name={overview.player.name}
          dailyStreak={overview.dailyChallenge.currentStreak}
          onOpenAccountMenu={() => setAccountMenuVisible(true)}
        />
        <HeroCard onStartTraining={onOpenPlay} />
        <DailyChallengeCard challenge={overview.dailyChallenge} onPress={onOpenPlay} />

        <Section>{texts.home.chooseMode}</Section>
        <GameModeList
          modes={modeCatalog}
          onSelect={(mode) => {
            if (isPlayable(mode)) {
              onSelectMode(mode.id);
            }
          }}
        />

        <Section>{texts.home.progress}</Section>
        <LevelProgressCard progress={overview.progress} />

        <Section>{texts.home.summary}</Section>
        <QuickStats stats={overview.stats} />
      </Content>

      <AccountMenu
        visible={accountMenuVisible}
        onDismiss={closeAccountMenu}
        onViewProfile={() => {
          closeAccountMenu();
          onViewProfile();
        }}
        onSignOut={() => {
          closeAccountMenu();
          signOut();
        }}
      />
    </Screen>
  );
}
