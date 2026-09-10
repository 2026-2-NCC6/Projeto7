import { SimulatedTargetDevice } from '../adapters/simulated/simulated-device';
import { WebSocketTargetDevice } from '../adapters/websocket/websocket-device';
import type { DeviceConfig } from '../config';
import type { TargetDevice } from '../contracts/target-device';

/**
 * The single place a transport is chosen. Both adapters implement the same port,
 * so the gameplay engine never learns which one is behind it.
 */
export function createTargetDevice(config: DeviceConfig): TargetDevice {
  switch (config.source) {
    case 'simulated':
      return new SimulatedTargetDevice();
    case 'websocket':
      return new WebSocketTargetDevice(config.wallUrl);
  }
}
