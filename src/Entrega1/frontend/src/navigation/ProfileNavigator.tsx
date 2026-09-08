import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AchievementsScreen } from '../screens/Achievements';
import { ProfileScreen } from '../screens/Profile';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ProfileOverview">
        {({ navigation }) => (
          <ProfileScreen
            onOpenAchievements={(achievements) =>
              navigation.navigate('Achievements', { achievements })
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Achievements">
        {({ navigation, route }) => (
          <AchievementsScreen
            achievements={route.params.achievements}
            onGoBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
