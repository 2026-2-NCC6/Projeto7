import type { DeviceConnectionStatus, DeviceEvent } from '../../contracts/device-event';
import type {
  DeviceDescriptor,
  DeviceUnsubscribe,
  TargetDevice,
} from '../../contracts/target-device';
import { DeviceEventPipeline } from '../../runtime/event-pipeline';
import { controlFrameOf, sessionCommand } from './wall-protocol';

const descriptor: DeviceDescriptor = {
  id: 'smash-wall',
  kind: 'websocket',
  providesImpact: true,
};

const FIRST_RETRY_MS = 500;
const MAX_RETRY_MS = 8000;
/** The wall sends a status frame every 2 s; three missed ones mean the link is gone. */
const SILENCE_LIMIT_MS = 7000;

/**
 * The real wall. It receives the very same `Impacto` payload the simulator builds
 * and pushes it through the very same parser and pipeline, so nothing downstream
 * can tell the two apart — except that these impact readings are real, which is
 * what makes the results screen show a force number instead of a dash.
 */
export class WebSocketTargetDevice implements TargetDevice {
  readonly descriptor = descriptor;

  private connectionStatus: DeviceConnectionStatus = 'disconnected';
  private readonly listeners = new Set<(event: DeviceEvent) => void>();
  private readonly pipeline = new DeviceEventPipeline({
    deviceId: descriptor.id,
    simulatedImpact: false,
    now: () => Date.now(),
  });

  private socket: WebSocket | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private retryDelayMs = FIRST_RETRY_MS;
  private wanted = false;

  constructor(private readonly url: string) {}

  get status(): DeviceConnectionStatus {
    return this.connectionStatus;
  }

  connect(): Promise<void> {
    this.wanted = true;
    this.open();
    return Promise.resolve();
  }

  disconnect(): Promise<void> {
    this.wanted = false;
    this.clearTimers();
    this.closeSocket();
    this.setStatus('disconnected');
    return Promise.resolve();
  }

  subscribe(listener: (event: DeviceEvent) => void): DeviceUnsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private open(): void {
    this.clearTimers();
    this.closeSocket();
    this.setStatus('connecting');

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onopen = () => {
      this.retryDelayMs = FIRST_RETRY_MS;
      // The wall's clock restarts at zero on every boot, so the pipeline has to
      // forget the timestamps it was comparing against or every event looks stale.
      this.pipeline.reset();
      socket.send(sessionCommand(`app-${Date.now()}`));
      this.setStatus('connected');
      this.watchForSilence();
    };

    socket.onmessage = (event) => this.receive(event.data);

    socket.onerror = () => {
      this.publish({
        kind: 'fault',
        code: 'transport',
        detail: `falha no socket ${this.url}`,
        at: Date.now(),
      });
    };

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
      }

      if (this.wanted) {
        this.setStatus('lost');
        this.scheduleRetry();
      }
    };
  }

  private receive(data: unknown): void {
    this.watchForSilence();

    if (typeof data !== 'string') {
      this.publish({
        kind: 'fault',
        code: 'malformedMessage',
        detail: 'quadro binário',
        at: Date.now(),
      });
      return;
    }

    let message: unknown;

    try {
      message = JSON.parse(data);
    } catch {
      this.publish({
        kind: 'fault',
        code: 'malformedMessage',
        detail: 'JSON inválido',
        at: Date.now(),
      });
      return;
    }

    // A tagged frame is the wall talking about itself, never an impact.
    if (controlFrameOf(message)) {
      return;
    }

    this.publish(this.pipeline.ingest(message));
  }

  /** A silent link is a lost link, even when the socket never closed. */
  private watchForSilence(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.silenceTimer = setTimeout(() => {
      if (this.wanted && this.connectionStatus === 'connected') {
        this.setStatus('lost');
        this.closeSocket();
        this.scheduleRetry();
      }
    }, SILENCE_LIMIT_MS);
  }

  private scheduleRetry(): void {
    if (this.retryTimer) {
      return;
    }

    const delay = this.retryDelayMs;
    this.retryDelayMs = Math.min(MAX_RETRY_MS, delay * 2);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;

      if (this.wanted) {
        this.open();
      }
    }, delay);
  }

  private closeSocket(): void {
    const socket = this.socket;

    if (!socket) {
      return;
    }

    this.socket = null;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close();
  }

  private clearTimers(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private setStatus(status: DeviceConnectionStatus): void {
    this.connectionStatus = status;
    this.publish({ kind: 'status', status, deviceId: descriptor.id, at: Date.now() });
  }

  private publish(event: DeviceEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
