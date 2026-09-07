import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { fontAssets, theme } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar style="dark" />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
