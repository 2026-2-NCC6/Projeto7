import type {
  DeviceConnectionStatus,
  DeviceDescriptor,
  DeviceFaultEvent,
} from '../../../device/contracts';
import type { DeviceTelemetry } from '../../../device/runtime/device-telemetry';
import { formatClock, formatNumber, formatTimeOfDay } from '../../../content/formatters';
import { texts } from '../../../content/texts';
import type { DataIndicator, DataItem } from './dataItem';

const statusIndicators: Record<DeviceConnectionStatus, DataIndicator> = {
  connected: 'positive',
  connecting: 'warning',
  disconnected: 'negative',
  lost: 'negative',
};

export interface DeviceSnapshot {
  descriptor: DeviceDescriptor;
  status: DeviceConnectionStatus;
  telemetry: DeviceTelemetry;
  lastFault: DeviceFaultEvent | null;
  wallUrl: string;
}

export interface SystemSnapshot {
  appVersion: string | null;
  platform: string;
  apiBaseUrl: string;
  isDevelopment: boolean;
}

function orNull<TValue>(value: TValue | null, format: (value: TValue) => string): string | null {
  return value === null ? null : format(value);
}

export function canReconnect(status: DeviceConnectionStatus): boolean {
  return status === 'disconnected' || status === 'lost';
}

export function deviceItems({
  descriptor,
  status,
  telemetry,
  lastFault,
  wallUrl,
}: DeviceSnapshot): DataItem[] {
  return [
    {
      key: 'status',
      label: texts.stats.connection,
      value: texts.stats.deviceStatus[status],
      indicator: statusIndicators[status],
    },
    { key: 'source', label: texts.stats.source, value: texts.stats.deviceKinds[descriptor.kind] },
    { key: 'deviceId', label: texts.stats.deviceId, value: descriptor.id },
    {
      key: 'address',
      label: texts.stats.address,
      value: descriptor.kind === 'websocket' ? wallUrl : null,
    },
    {
      key: 'impactReading',
      label: texts.stats.impactReading,
      value: descriptor.providesImpact ? texts.stats.supported : texts.stats.notSupported,
    },
    { key: 'connectedSince', label: texts.stats.connectedSince, value: orNull(telemetry.connectedAt, formatTimeOfDay) },
    { key: 'hitsReceived', label: texts.stats.hitsReceived, value: formatNumber(telemetry.hitsReceived) },
    { key: 'lastHit', label: texts.stats.lastHit, value: orNull(telemetry.lastHitAt, formatTimeOfDay) },
    { key: 'deviceUptime', label: texts.stats.deviceUptime, value: orNull(telemetry.deviceUptimeMs, formatClock) },
    {
      key: 'faultsReceived',
      label: texts.stats.faultsReceived,
      value: formatNumber(telemetry.faultsReceived),
      indicator: telemetry.faultsReceived > 0 ? 'warning' : undefined,
    },
    {
      key: 'lastFault',
      label: texts.stats.lastFault,
      value: lastFault ? texts.stats.faultCodes[lastFault.code] : null,
    },
  ];
}

export function sensorItems(): DataItem[] {
  return [
    { key: 'firmwareVersion', label: texts.stats.firmwareVersion, value: null },
    { key: 'wifiSignal', label: texts.stats.wifiSignal, value: null },
    { key: 'thresholds', label: texts.stats.thresholds, value: null },
    { key: 'mqttBroker', label: texts.stats.mqttBroker, value: null },
  ];
}

export function systemItems({
  appVersion,
  platform,
  apiBaseUrl,
  isDevelopment,
}: SystemSnapshot): DataItem[] {
  return [
    { key: 'appVersion', label: texts.stats.appVersion, value: appVersion },
    { key: 'platform', label: texts.stats.platform, value: platform },
    { key: 'apiServer', label: texts.stats.apiServer, value: apiBaseUrl },
    {
      key: 'environment',
      label: texts.stats.environment,
      value: isDevelopment ? texts.stats.development : texts.stats.production,
    },
  ];
}
