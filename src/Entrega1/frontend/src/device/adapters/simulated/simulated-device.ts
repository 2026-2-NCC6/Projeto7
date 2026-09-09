import type {
  DeviceConnectionStatus,
  DeviceEvent,
} from '../../contracts/device-event';
import { IMPACT_MAX_RAW } from '../../contracts/impact';
import { wallTarget, type TargetId } from '../../contracts/target';
import type {
  DeviceDescriptor,
  DeviceUnsubscribe,
  TargetDevice,
} from '../../contracts/target-device';
import { DeviceEventPipeline } from '../../runtime/event-pipeline';

const CONNECT_DELAY_MS = 450;
const IMPACT_FLOOR = 900;
const IMPACT_CEILING = 3400;

const descriptor: DeviceDescriptor = {
  id: 'smash-simulator',
  kind: 'simulated',
  providesImpact: true,
};

function randomImpact(): number {
  const span = IMPACT_CEILING - IMPACT_FLOOR;
  return Math.min(IMPACT_MAX_RAW, IMPACT_FLOOR + Math.round(Math.random() * span));
}

/**
 * Stands in for the ESP32 while the wall does not exist. It builds the same
 * `Impacto` payload the firmware will publish and pushes it through the very
 * same parser and pipeline, so nothing downstream can tell the two apart.
 */
export class SimulatedTargetDevice implements TargetDevice {
  readonly descriptor = descriptor;

  private connectionStatus: DeviceConnectionStatus = 'disconnected';
  private readonly listeners = new Set<(event: DeviceEvent) => void>();
  private readonly pipeline = new DeviceEventPipeline({
    deviceId: descriptor.id,
    simulatedImpact: true,
    now: () => Date.now(),
  });
  private bootedAt = Date.now();
  private sessionTag = 'sim';
  private connectTimer: ReturnType<typeof setTimeout> | null = null;

  get status(): DeviceConnectionStatus {
    return this.connectionStatus;
  }

  connect(): Promise<void> {
    this.clearConnectTimer();
    this.bootedAt = Date.now();
    this.sessionTag = `sim-${this.bootedAt}`;
    this.pipeline.reset();
    this.setStatus('connecting');

    return new Promise((resolve) => {
      this.connectTimer = setTimeout(() => {
        this.setStatus('connected');
        resolve();
      }, CONNECT_DELAY_MS);
    });
  }

  disconnect(): Promise<void> {
    this.clearConnectTimer();
    this.setStatus('disconnected');
    return Promise.resolve();
  }

  subscribe(listener: (event: DeviceEvent) => void): DeviceUnsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Simulator-only. Never part of `TargetDevice` — the engine cannot call it. */
  emitHit(targetId: TargetId): void {
    const target = wallTarget(targetId);

    if (!target || this.connectionStatus !== 'connected') {
      return;
    }

    this.emitRaw({
      alvo: target.id,
      linha: target.row,
      coluna: target.column,
      intensidade: randomImpact(),
      t_ms: Date.now() - this.bootedAt,
      sessao: this.sessionTag,
    });
  }

  /** Simulator-only. Feeds an arbitrary payload through the real parser. */
  emitRaw(raw: unknown): void {
    this.publish(this.pipeline.ingest(raw));
  }

  /** Simulator-only. Reproduces an unannounced drop mid-session. */
  dropConnection(): void {
    this.clearConnectTimer();
    this.setStatus('lost');
  }

  private setStatus(status: DeviceConnectionStatus): void {
    this.connectionStatus = status;
    this.publish({ kind: 'status', status, deviceId: descriptor.id, at: Date.now() });
  }

  private publish(event: DeviceEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  private clearConnectTimer(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }
}
