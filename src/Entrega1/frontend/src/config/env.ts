import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_PORT = 3000;
const WEB_DEV_PORT = 5173;

function inferHostFromExpo(): string | null {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  const host = hostUri?.split(':')[0];
  return host && host !== 'localhost' && host !== '127.0.0.1' ? host : null;
}

export interface ApiUrlSources {
  configured: string | undefined;
  lanHost: string | null;
  platform: typeof Platform.OS;
  isDevelopment: boolean;
}

/**
 * Where the API lives. A development build may talk plain HTTP to the machine
 * running Metro; any other build carries the player's token, so it only talks
 * HTTPS and refuses to start otherwise.
 */
export function resolveApiBaseUrl({
  configured,
  lanHost,
  platform,
  isDevelopment,
}: ApiUrlSources): string {
  if (!isDevelopment) {
    if (!configured?.startsWith('https://')) {
      throw new Error('EXPO_PUBLIC_API_URL precisa ser um endereço https:// fora do modo de desenvolvimento.');
    }
    return configured;
  }

  if (configured) {
    return configured;
  }

  if (lanHost) {
    return `http://${lanHost}:${DEFAULT_PORT}`;
  }

  const fallbackHost = platform === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallbackHost}:${DEFAULT_PORT}`;
}

export function resolveWebUrl(
  configured: string | undefined,
  lanHost: string | null,
  isDevelopment: boolean,
): string | null {
  if (configured) {
    return configured;
  }

  return isDevelopment && lanHost ? `http://${lanHost}:${WEB_DEV_PORT}` : null;
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl({
    configured: process.env.EXPO_PUBLIC_API_URL,
    lanHost: inferHostFromExpo(),
    platform: Platform.OS,
    isDevelopment: __DEV__,
  }),
  webUrl: resolveWebUrl(process.env.EXPO_PUBLIC_WEB_URL, inferHostFromExpo(), __DEV__),
} as const;
