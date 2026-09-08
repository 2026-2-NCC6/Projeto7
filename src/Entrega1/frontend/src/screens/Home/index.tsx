import { useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Screen } from '../../components/Screen';
import { greetingFor } from '../../content/greeting';
import { texts } from '../../content/texts';
import { useHomeOverview } from '../../hooks/useHomeOverview';
import { useAuthStore } from '../../store/authStore';
import { AccountMenu } from './components/AccountMenu';
import { DailyChallengeCard } from './components/DailyChallengeCard';
import { GameModeList } from './components/GameModeList';
import { HeroCard } from './components/HeroCard';
import { HomeHeader } from './components/HomeHeader';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { QuickStats } from './components/QuickStats';
import { gameModes } from './data/gameModes';
import { Centered, Content, ErrorMessage, RetryLabel, Section } from './styles';

interface HomeScreenProps {
  onViewProfile: () => void;
}

export function HomeScreen({ onViewProfile }: HomeScreenProps) {
  const theme = useTheme();
  const signOut = useAuthStore((state) => state.signOut);
  const { overview, loading, error, reload } = useHomeOverview();
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);

  const closeAccountMenu = () => setAccountMenuVisible(false);

  const noop = () => undefined;

  if (loading) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <ActivityIndicator color={theme.colors.primary} size="large" />
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
        <HeroCard onStartTraining={noop} />
        <DailyChallengeCard challenge={overview.dailyChallenge} onPress={noop} />

        <Section>{texts.home.chooseMode}</Section>
        <GameModeList modes={gameModes} onSelect={noop} />

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
