import { useContext } from 'react';
import { DeviceContext, type DeviceContextValue } from './DeviceProvider';

export function useDevice(): DeviceContextValue {
  const context = useContext(DeviceContext);

  if (!context) {
    throw new Error('useDevice precisa estar dentro de um DeviceProvider.');
  }

  return context;
}
