import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components/native';
import type { DeviceConnectionStatus, TargetDevice } from '../src/device/contracts';
import { DeviceContext, type DeviceContextValue } from '../src/device/runtime/DeviceProvider';
import { INITIAL_DEVICE_TELEMETRY } from '../src/device/runtime/device-telemetry';
import { themes, type ThemeMode } from '../src/theme';

export function fakeDeviceContext(
  overrides: Partial<DeviceContextValue> = {},
  status: DeviceConnectionStatus = 'connected',
): DeviceContextValue {
  const device: TargetDevice = {
    descriptor: { id: 'simulador-local', kind: 'simulated', providesImpact: false },
    status,
    connect: jest.fn(async () => undefined),
    disconnect: jest.fn(async () => undefined),
    subscribe: jest.fn(() => () => undefined),
  };

  return {
    device,
    status,
    lastFault: null,
    telemetry: INITIAL_DEVICE_TELEMETRY,
    reconnect: jest.fn(),
    ...overrides,
  };
}

interface ProviderOptions {
  mode?: ThemeMode;
  device?: DeviceContextValue;
}

export function renderWithProviders(
  element: ReactElement,
  { mode = 'light', device = fakeDeviceContext() }: ProviderOptions = {},
) {
  function Providers({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider theme={themes[mode]}>
        <DeviceContext.Provider value={device}>{children}</DeviceContext.Provider>
      </ThemeProvider>
    );
  }

  return render(element, { wrapper: Providers });
}

export function deferred<TValue>() {
  let resolve!: (value: TValue) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<TValue>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}
