import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { useTheme } from 'styled-components/native';
import { useAuthStore } from '../store/authStore';
import { type AppTheme, type ThemeMode, themes } from '../theme';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

function navigationThemeFor(theme: AppTheme): Theme {
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primaryDark,
      background: theme.colors.background,
      card: theme.colors.surfaceRaised,
      text: theme.colors.ink,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}

const navigationThemes: Record<ThemeMode, Theme> = {
  light: navigationThemeFor(themes.light),
  dark: navigationThemeFor(themes.dark),
};

export function RootNavigator() {
  const theme = useTheme();
  const session = useAuthStore((state) => state.session);

  return (
    <NavigationContainer theme={navigationThemes[theme.mode]}>
      {session === 'none' ? <AuthNavigator /> : <AppNavigator />}
    </NavigationContainer>
  );
}
