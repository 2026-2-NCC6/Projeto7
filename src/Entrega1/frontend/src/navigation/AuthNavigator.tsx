import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/Login';
import { SignUpScreen } from '../screens/SignUp';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen onNavigateToSignUp={() => navigation.navigate('SignUp')} />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {({ navigation }) => <SignUpScreen onNavigateToLogin={() => navigation.goBack()} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
