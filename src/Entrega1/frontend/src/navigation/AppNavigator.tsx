import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOutboxSync } from '../gameplay/outbox/useOutboxSync';
import { stepOf } from '../gameplay/training/training-run';
import { SafetyLockOverlay } from '../screens/SafetyLock';
import { AppTabs } from './AppTabs';
import { GameNavigator } from './GameNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  useOutboxSync();

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Tabs">
          {({ navigation }) => (
            <AppTabs
              onStartLevel={(mode, level) => navigation.navigate('Game', { mode, level })}
              onStartTraining={(training) =>
                navigation.navigate('Game', { mode: stepOf(training).mode, level: 0, training })
              }
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Game" component={GameNavigator} />
      </Stack.Navigator>
      <SafetyLockOverlay />
    </>
  );
}
