import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { LevelProgressCard } from '../../components/LevelProgressCard';
import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import { useProfile } from '../../hooks/useProfile';
import type { Achievement } from '../../services/profile/types';
import { useAuthStore } from '../../store/authStore';
import { AchievementStrip } from './components/AchievementStrip';
import { FavoriteModeCard } from './components/FavoriteModeCard';
import { PersonalRecords } from './components/PersonalRecords';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileStats } from './components/ProfileStats';
import { SettingsList } from './components/SettingsList';
import { Centered, Content, ErrorMessage, GuestMessage, RetryLabel, Section } from './styles';

interface ProfileScreenProps {
  onOpenAchievements: (achievements: Achievement[]) => void;
}

export function ProfileScreen({ onOpenAchievements }: ProfileScreenProps) {
  const theme = useTheme();
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const { profile, loading, error, reload } = useProfile();

  if (session === 'guest') {
    return (
      <Screen edges={['top']}>
        <Content>
          <ProfileHeader
            name={texts.profile.guestName}
            subtitle={texts.profile.guestSubtitle}
          />
          <GuestMessage>{texts.profile.guestMessage}</GuestMessage>

          <Section>{texts.profile.settings}</Section>
          <SettingsList onSignOut={signOut} />
        </Content>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </Centered>
      </Screen>
    );
  }

  if (error || !profile) {
    return (
      <Screen edges={['top']}>
        <Centered>
          <ErrorMessage>{error ?? texts.profile.loadError}</ErrorMessage>
          <Pressable onPress={reload} accessibilityRole="button">
            <RetryLabel>{texts.profile.retry}</RetryLabel>
          </Pressable>
        </Centered>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <Content>
        <ProfileHeader
          name={profile.player.name}
          subtitle={texts.profile.subtitle(profile.player.email, profile.player.level)}
        />
        <ProfileStats stats={profile.stats} />
        {profile.favoriteMode ? <FavoriteModeCard mode={profile.favoriteMode} /> : null}

        <Section>{texts.profile.records}</Section>
        <PersonalRecords records={profile.records} />

        <Section>{texts.profile.progress}</Section>
        <LevelProgressCard progress={profile.progress} />

        <AchievementStrip achievements={profile.achievements} onSeeAll={() => onOpenAchievements(profile.achievements)} />

        <Section>{texts.profile.settings}</Section>
        <SettingsList onSignOut={signOut} />
      </Content>
    </Screen>
  );
}
