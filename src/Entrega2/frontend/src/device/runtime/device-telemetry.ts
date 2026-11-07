import type { DeviceEvent } from '../contracts/device-event';

export interface DeviceTelemetry {
  readonly hitsReceived: number;
  readonly faultsReceived: number;
  readonly lastHitAt: number | null;
  readonly deviceUptimeMs: number | null;
  readonly connectedAt: number | null;
}

export const INITIAL_DEVICE_TELEMETRY: DeviceTelemetry = {
  hitsReceived: 0,
  faultsReceived: 0,
  lastHitAt: null,
  deviceUptimeMs: null,
  connectedAt: null,
};

export function recordDeviceEvent(telemetry: DeviceTelemetry, event: DeviceEvent): DeviceTelemetry {
  switch (event.kind) {
    case 'targetHit':
      return {
        ...telemetry,
        hitsReceived: telemetry.hitsReceived + 1,
        lastHitAt: event.receivedAt,
        deviceUptimeMs: event.deviceUptimeMs,
      };
    case 'fault':
      return { ...telemetry, faultsReceived: telemetry.faultsReceived + 1 };
    case 'status':
      if (event.status === 'connected') {
        return { ...telemetry, connectedAt: telemetry.connectedAt ?? event.at };
      }
      return event.status === 'connecting' ? telemetry : { ...telemetry, connectedAt: null };
  }
}
