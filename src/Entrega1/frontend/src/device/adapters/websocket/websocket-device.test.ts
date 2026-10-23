import type { DeviceEvent } from '../../contracts/device-event';
import { WebSocketTargetDevice } from './websocket-device';

class FakeSocket {
  static last: FakeSocket | null = null;

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  readonly sent: string[] = [];

  constructor(readonly url: string) {
    FakeSocket.last = this;
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {}

  receive(frame: object): void {
    this.onmessage?.({ data: JSON.stringify(frame) });
  }
}

const hello = { tipo: 'hello', protocolo: 2, parede: 'wall-1', alvos: 6, sessao: 'app-1', t_ms: 10 };

async function connectedDevice() {
  const device = new WebSocketTargetDevice('ws://wall.test:81');
  const events: DeviceEvent[] = [];
  device.subscribe((event) => events.push(event));
  await device.connect();
  FakeSocket.last!.onopen?.();
  return { device, events, socket: FakeSocket.last! };
}

describe('WebSocketTargetDevice', () => {
  const realWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    jest.useFakeTimers();
    (globalThis as { WebSocket: unknown }).WebSocket = FakeSocket;
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as { WebSocket: unknown }).WebSocket = realWebSocket;
  });

  it('sends the session id and turns impacts into hits', async () => {
    const { device, events, socket } = await connectedDevice();

    socket.receive(hello);
    socket.receive({ alvo: 4, linha: 2, coluna: 1, intensidade: 900, t_ms: 50, sessao: 'app-1' });

    expect(JSON.parse(socket.sent[0])).toMatchObject({ cmd: 'session' });
    expect(events.filter((event) => event.kind === 'fault')).toEqual([]);
    expect(events.at(-1)).toMatchObject({ kind: 'targetHit', targetId: 4, row: 2, column: 1 });
    await device.disconnect();
  });

  it.each([
    ['an old protocol version', { ...hello, protocolo: 1 }],
    ['a wall with another number of targets', { ...hello, alvos: 9 }],
  ])('reports %s as an incompatible wall', async (_, frame) => {
    const { device, events, socket } = await connectedDevice();

    socket.receive(frame);

    expect(events.at(-1)).toMatchObject({ kind: 'fault', code: 'incompatibleWall' });
    expect(device.status).toBe('connected');
    await device.disconnect();
  });
});
