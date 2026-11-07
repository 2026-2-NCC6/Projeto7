import { INITIAL_DEVICE_TELEMETRY } from '../../../device/runtime/device-telemetry';
import { canReconnect, deviceItems, sensorItems, systemItems } from './telemetryItems';

const valueOf = (items: { key: string; value: string | null }[], key: string) =>
  items.find((item) => item.key === key)?.value;

describe('deviceItems', () => {
  it('describes a simulated device without inventing hardware data', () => {
    const items = deviceItems({
      descriptor: { id: 'simulador', kind: 'simulated', providesImpact: false },
      status: 'connected',
      telemetry: INITIAL_DEVICE_TELEMETRY,
      lastFault: null,
      wallUrl: 'ws://192.168.4.1:81',
    });

    expect(valueOf(items, 'status')).toBe('Conectado');
    expect(items.find((item) => item.key === 'status')?.indicator).toBe('positive');
    expect(valueOf(items, 'source')).toBe('Simulador');
    expect(valueOf(items, 'address')).toBeNull();
    expect(valueOf(items, 'impactReading')).toBe('Não disponível');
    expect(valueOf(items, 'lastHit')).toBeNull();
    expect(valueOf(items, 'lastFault')).toBeNull();
  });

  it('shows the wall address, counters and the last fault', () => {
    const items = deviceItems({
      descriptor: { id: 'smash-wall', kind: 'websocket', providesImpact: true },
      status: 'lost',
      telemetry: {
        ...INITIAL_DEVICE_TELEMETRY,
        hitsReceived: 1234,
        faultsReceived: 2,
        deviceUptimeMs: 65_000,
      },
      lastFault: { kind: 'fault', code: 'staleEvent', detail: '', at: 1 },
      wallUrl: 'ws://192.168.4.1:81',
    });

    expect(valueOf(items, 'address')).toBe('ws://192.168.4.1:81');
    expect(valueOf(items, 'hitsReceived')).toBe('1.234');
    expect(valueOf(items, 'deviceUptime')).toBe('1:05');
    expect(valueOf(items, 'lastFault')).toBe('Evento fora de ordem');
    expect(items.find((item) => item.key === 'faultsReceived')?.indicator).toBe('warning');
    expect(items.find((item) => item.key === 'status')?.indicator).toBe('negative');
  });
});

describe('canReconnect', () => {
  it('offers reconnect only when the link is down', () => {
    expect(canReconnect('lost')).toBe(true);
    expect(canReconnect('disconnected')).toBe(true);
    expect(canReconnect('connecting')).toBe(false);
    expect(canReconnect('connected')).toBe(false);
  });
});

describe('sensorItems and systemItems', () => {
  it('lists future sensor fields as unavailable', () => {
    expect(sensorItems().every((item) => item.value === null)).toBe(true);
  });

  it('describes the running app', () => {
    const items = systemItems({
      appVersion: null,
      platform: 'android 35',
      apiBaseUrl: 'http://10.0.2.2:3000',
      isDevelopment: true,
    });

    expect(valueOf(items, 'appVersion')).toBeNull();
    expect(valueOf(items, 'environment')).toBe('Desenvolvimento');
  });
});
