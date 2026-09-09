import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabs } from './AppTabs';
import { GameNavigator } from './GameNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Tabs">
        {({ navigation }) => (
          <AppTabs
            onStartLevel={(mode, level) => navigation.navigate('Game', { mode, level })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Game" component={GameNavigator} />
    </Stack.Navigator>
  );
}
