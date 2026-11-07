import type { DeviceConnectionStatus, DeviceEvent } from './device-event';

export type DeviceKind = 'simulated' | 'websocket';

export interface DeviceDescriptor {
  readonly id: string;
  readonly kind: DeviceKind;
  readonly providesImpact: boolean;
}

export type DeviceUnsubscribe = () => void;

/** What the wall should play to guide and reward the player. */
export type WallFeedback = 'hit' | 'miss' | 'levelCleared' | 'levelFailed';

export interface TargetDevice {
  readonly descriptor: DeviceDescriptor;
  readonly status: DeviceConnectionStatus;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(listener: (event: DeviceEvent) => void): DeviceUnsubscribe;
  /** Fire-and-forget: a wall that is not connected, or has no actuator, ignores it. */
  signal(feedback: WallFeedback): void;
}
