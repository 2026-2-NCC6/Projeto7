import { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { deviceConfig } from '../config';
import type {
  DeviceConnectionStatus,
  DeviceFaultEvent,
} from '../contracts/device-event';
import type { TargetDevice } from '../contracts/target-device';
import { createTargetDevice } from './device-factory';

export interface DeviceContextValue {
  device: TargetDevice;
  status: DeviceConnectionStatus;
  lastFault: DeviceFaultEvent | null;
  reconnect: () => void;
}

export const DeviceContext = createContext<DeviceContextValue | null>(null);

interface DeviceProviderProps {
  children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  const deviceRef = useRef<TargetDevice | null>(null);
  deviceRef.current ??= createTargetDevice(deviceConfig);
  const device = deviceRef.current;

  const [status, setStatus] = useState<DeviceConnectionStatus>(device.status);
  const [lastFault, setLastFault] = useState<DeviceFaultEvent | null>(null);

  useEffect(() => {
    const unsubscribe = device.subscribe((event) => {
      if (event.kind === 'status') {
        setStatus(event.status);
      }
      if (event.kind === 'fault') {
        setLastFault(event);
      }
    });

    void device.connect();

    return () => {
      unsubscribe();
      void device.disconnect();
    };
  }, [device]);

  const value = useMemo<DeviceContextValue>(
    () => ({
      device,
      status,
      lastFault,
      reconnect: () => {
        setLastFault(null);
        void device.connect();
      },
    }),
    [device, status, lastFault],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}
