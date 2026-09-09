import type { TargetColor } from '../../types/game';
import type { ImpactReading } from './impact';
import type { GridIndex, TargetId } from './target';

export type DeviceConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'lost';

export interface TargetHitEvent {
  readonly kind: 'targetHit';
  readonly eventId: string;
  readonly deviceId: string;
  readonly targetId: TargetId;
  readonly color: TargetColor;
  readonly row: GridIndex;
  readonly column: GridIndex;
  readonly impact: ImpactReading | null;
  readonly deviceUptimeMs: number;
  readonly receivedAt: number;
}

export interface DeviceStatusEvent {
  readonly kind: 'status';
  readonly status: DeviceConnectionStatus;
  readonly deviceId: string | null;
  readonly at: number;
}

export type DeviceFaultCode =
  | 'malformedMessage'
  | 'unknownTarget'
  | 'duplicateEvent'
  | 'staleEvent'
  | 'transport';

export interface DeviceFaultEvent {
  readonly kind: 'fault';
  readonly code: DeviceFaultCode;
  readonly detail: string;
  readonly at: number;
}

export type DeviceEvent = TargetHitEvent | DeviceStatusEvent | DeviceFaultEvent;
