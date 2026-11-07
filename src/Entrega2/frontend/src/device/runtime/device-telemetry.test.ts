import { INITIAL_DEVICE_TELEMETRY, recordDeviceEvent } from './device-telemetry';

describe('recordDeviceEvent', () => {
  it('counts hits and keeps the latest wall uptime', () => {
    const hit = {
      kind: 'targetHit' as const,
      eventId: 'e1',
      deviceId: 'wall',
      targetId: 5 as const,
      color: 'red' as const,
      row: 2 as const,
      column: 2 as const,
      impact: null,
      deviceUptimeMs: 90_000,
      receivedAt: 1_000,
    };

    const telemetry = recordDeviceEvent(
      recordDeviceEvent(INITIAL_DEVICE_TELEMETRY, hit),
      { ...hit, eventId: 'e2', deviceUptimeMs: 91_000, receivedAt: 2_000 },
    );

    expect(telemetry).toMatchObject({ hitsReceived: 2, lastHitAt: 2_000, deviceUptimeMs: 91_000 });
  });

  it('counts faults', () => {
    const telemetry = recordDeviceEvent(INITIAL_DEVICE_TELEMETRY, {
      kind: 'fault',
      code: 'malformedMessage',
      detail: 'bad json',
      at: 5,
    });

    expect(telemetry.faultsReceived).toBe(1);
  });

  it('keeps the first connection time and clears it when the link drops', () => {
    const status = (value: 'connected' | 'connecting' | 'lost', at: number) => ({
      kind: 'status' as const,
      status: value,
      deviceId: 'wall',
      at,
    });

    const connected = recordDeviceEvent(INITIAL_DEVICE_TELEMETRY, status('connected', 10));
    const stillConnected = recordDeviceEvent(connected, status('connected', 20));
    const reconnecting = recordDeviceEvent(stillConnected, status('connecting', 30));
    const lost = recordDeviceEvent(reconnecting, status('lost', 40));

    expect(stillConnected.connectedAt).toBe(10);
    expect(reconnecting.connectedAt).toBe(10);
    expect(lost.connectedAt).toBeNull();
  });
});
