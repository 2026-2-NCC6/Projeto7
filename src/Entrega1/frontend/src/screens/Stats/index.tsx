import { RefreshControl } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import { usePlayerStatistics } from '../../hooks/usePlayerStatistics';
import { useAuthStore } from '../../store/authStore';
import { DeviceCard } from './components/DeviceCard';
import { PlayerSection } from './components/PlayerSection';
import { SensorsCard } from './components/SensorsCard';
import { StatsHeader } from './components/StatsHeader';
import { SystemCard } from './components/SystemCard';
import { WebDashboardCard } from './components/WebDashboardCard';
import { Content, Section } from './styles';

export function StatsScreen() {
  const theme = useTheme();
  const isGuest = useAuthStore((state) => state.session === 'guest');
  const signOut = useAuthStore((state) => state.signOut);
  const statistics = usePlayerStatistics();

  return (
    <Screen edges={['top']}>
      <Content
        refreshControl={
          <RefreshControl
            refreshing={statistics.loading && statistics.data !== null}
            onRefresh={statistics.reload}
            tintColor={theme.colors.primaryDark}
            colors={[theme.colors.primaryDark]}
            progressBackgroundColor={theme.colors.surfaceRaised}
          />
        }
      >
        <StatsHeader player={statistics.data?.player ?? null} />
        <PlayerSection isGuest={isGuest} resource={statistics} onSignIn={signOut} />

        <WebDashboardCard />

        <Section>{texts.stats.hardwareSection}</Section>
        <DeviceCard />
        <SensorsCard />
        <SystemCard />
      </Content>
    </Screen>
  );
}
