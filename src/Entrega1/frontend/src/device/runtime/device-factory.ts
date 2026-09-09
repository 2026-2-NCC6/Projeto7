import { SimulatedTargetDevice } from '../adapters/simulated/simulated-device';
import type { DeviceKind, TargetDevice } from '../contracts/target-device';

/**
 * The single place a transport is chosen. Adding the ESP32 means one new class
 * implementing `TargetDevice` and one new branch here — nothing else changes.
 */
export function createTargetDevice(kind: DeviceKind): TargetDevice {
  switch (kind) {
    case 'simulated':
      return new SimulatedTargetDevice();
    case 'websocket':
      throw new Error('O adaptador WebSocket do ESP32 ainda não foi implementado.');
  }
}
