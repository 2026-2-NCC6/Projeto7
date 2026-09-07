import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_PORT = 3000;

function inferHostFromExpo(): string | null {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  const host = hostUri?.split(':')[0];
  return host && host !== 'localhost' && host !== '127.0.0.1' ? host : null;
}

function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) {
    return configured;
  }

  const lanHost = inferHostFromExpo();
  if (lanHost) {
    return `http://${lanHost}:${DEFAULT_PORT}`;
  }

  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallbackHost}:${DEFAULT_PORT}`;
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
} as const;
