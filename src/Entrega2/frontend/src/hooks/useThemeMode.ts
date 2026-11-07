import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import type { ThemeMode } from '../theme';

interface ThemeModeState {
  mode: ThemeMode;
  hydrated: boolean;
}

export function useThemeMode(): ThemeModeState {
  const preference = useThemeStore((state) => state.preference);
  const hydrated = useThemeStore((state) => state.hydrated);
  const systemScheme = useColorScheme();

  return {
    mode: preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference,
    hydrated,
  };
}
