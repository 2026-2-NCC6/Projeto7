import {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { deviceConfig } from '../config';
import type {
  DeviceConnectionStatus,
  DeviceFaultEvent,
} from '../contracts/device-event';
import type { TargetDevice } from '../contracts/target-device';
import { createTargetDevice } from './device-factory';
import {
  INITIAL_DEVICE_TELEMETRY,
  recordDeviceEvent,
  type DeviceTelemetry,
} from './device-telemetry';

export interface DeviceContextValue {
  device: TargetDevice;
  status: DeviceConnectionStatus;
  lastFault: DeviceFaultEvent | null;
  telemetry: DeviceTelemetry;
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
  const [telemetry, record] = useReducer(recordDeviceEvent, INITIAL_DEVICE_TELEMETRY);

  useEffect(() => {
    const unsubscribe = device.subscribe((event) => {
      record(event);
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
      telemetry,
      reconnect: () => {
        setLastFault(null);
        void device.connect();
      },
    }),
    [device, status, lastFault, telemetry],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}
