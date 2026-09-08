import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';
import { useThemeMode } from './src/hooks/useThemeMode';
import { RootNavigator } from './src/navigation/RootNavigator';
import { fontAssets, themes } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const { mode, hydrated } = useThemeMode();

  if (!fontsLoaded || !hydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={themes[mode]}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
