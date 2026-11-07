import type { DeviceFaultEvent, TargetHitEvent } from '../contracts/device-event';
import { wallTarget } from '../contracts/target';
import { impactoSchema } from './impacto.schema';

export interface ParseContext {
  readonly deviceId: string;
  readonly simulatedImpact: boolean;
  readonly receivedAt: number;
}

function fault(code: DeviceFaultEvent['code'], detail: string, at: number): DeviceFaultEvent {
  return { kind: 'fault', code, detail, at };
}

export function parseDeviceMessage(
  raw: unknown,
  context: ParseContext,
): TargetHitEvent | DeviceFaultEvent {
  const parsed = impactoSchema.safeParse(raw);

  if (!parsed.success) {
    return fault('malformedMessage', parsed.error.issues[0]?.message ?? 'formato inesperado', context.receivedAt);
  }

  const message = parsed.data;
  const target = wallTarget(message.alvo);

  if (!target) {
    return fault('unknownTarget', `alvo ${message.alvo}`, context.receivedAt);
  }

  return {
    kind: 'targetHit',
    eventId: `${context.deviceId}:${message.sessao}:${message.t_ms}:${message.alvo}`,
    deviceId: context.deviceId,
    targetId: target.id,
    color: target.color,
    row: target.row,
    column: target.column,
    impact: { raw: message.intensidade, simulated: context.simulatedImpact },
    deviceUptimeMs: message.t_ms,
    receivedAt: context.receivedAt,
  };
}
