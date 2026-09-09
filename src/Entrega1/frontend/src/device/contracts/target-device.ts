import type { DeviceConnectionStatus, DeviceEvent } from './device-event';

export type DeviceKind = 'simulated' | 'websocket';

export interface DeviceDescriptor {
  readonly id: string;
  readonly kind: DeviceKind;
  readonly providesImpact: boolean;
}

export type DeviceUnsubscribe = () => void;

export interface TargetDevice {
  readonly descriptor: DeviceDescriptor;
  readonly status: DeviceConnectionStatus;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(listener: (event: DeviceEvent) => void): DeviceUnsubscribe;
}
