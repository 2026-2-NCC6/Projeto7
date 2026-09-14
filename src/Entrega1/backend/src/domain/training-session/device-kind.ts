export const DEVICE_KINDS = ['simulated', 'websocket'] as const;

export type DeviceKind = (typeof DEVICE_KINDS)[number];
