import type { DeviceKind } from './contracts/target-device';

function resolveDeviceSource(): DeviceKind {
  return process.env.EXPO_PUBLIC_DEVICE_SOURCE === 'websocket' ? 'websocket' : 'simulated';
}

export const deviceConfig = {
  source: resolveDeviceSource(),
} as const;
