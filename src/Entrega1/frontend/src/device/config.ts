import type { DeviceKind } from './contracts/target-device';

/** SoftAP address of the wall: the ESP32 creates the network and always answers here. */
const DEFAULT_WALL_URL = 'ws://192.168.4.1:81';

function resolveDeviceSource(): DeviceKind {
  return process.env.EXPO_PUBLIC_DEVICE_SOURCE === 'websocket' ? 'websocket' : 'simulated';
}

export const deviceConfig = {
  source: resolveDeviceSource(),
  wallUrl: process.env.EXPO_PUBLIC_DEVICE_URL ?? DEFAULT_WALL_URL,
} as const;

export type DeviceConfig = typeof deviceConfig;
