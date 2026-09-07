import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AppTabs } from './AppTabs';
import { AuthNavigator } from './AuthNavigator';

export function RootNavigator() {
  const session = useAuthStore((state) => state.session);

  return (
    <NavigationContainer>
      {session === 'none' ? <AuthNavigator /> : <AppTabs />}
    </NavigationContainer>
  );
}
