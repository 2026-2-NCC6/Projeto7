import type { DeviceEvent, TargetHitEvent } from '../contracts/device-event';
import { parseDeviceMessage, type ParseContext } from '../parsing/parse-device-message';

const RECENT_EVENT_MEMORY = 32;

export interface PipelineOptions {
  readonly deviceId: string;
  readonly simulatedImpact: boolean;
  readonly now: () => number;
}

export class DeviceEventPipeline {
  private readonly recentEventIds: string[] = [];
  private lastUptimeMs = -1;

  constructor(private readonly options: PipelineOptions) {}

  ingest(raw: unknown): DeviceEvent {
    const receivedAt = this.options.now();
    const context: ParseContext = {
      deviceId: this.options.deviceId,
      simulatedImpact: this.options.simulatedImpact,
      receivedAt,
    };

    const parsed = parseDeviceMessage(raw, context);

    if (parsed.kind === 'fault') {
      return parsed;
    }

    if (this.recentEventIds.includes(parsed.eventId)) {
      return { kind: 'fault', code: 'duplicateEvent', detail: parsed.eventId, at: receivedAt };
    }

    if (parsed.deviceUptimeMs < this.lastUptimeMs) {
      return {
        kind: 'fault',
        code: 'staleEvent',
        detail: `t_ms ${parsed.deviceUptimeMs} < ${this.lastUptimeMs}`,
        at: receivedAt,
      };
    }

    this.remember(parsed);
    return parsed;
  }

  reset(): void {
    this.recentEventIds.length = 0;
    this.lastUptimeMs = -1;
  }

  private remember(hit: TargetHitEvent): void {
    this.recentEventIds.push(hit.eventId);
    if (this.recentEventIds.length > RECENT_EVENT_MEMORY) {
      this.recentEventIds.shift();
    }
    this.lastUptimeMs = hit.deviceUptimeMs;
  }
}
