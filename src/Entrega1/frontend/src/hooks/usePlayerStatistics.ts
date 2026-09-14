import { useMemo } from 'react';
import { statisticsService } from '../services/statistics/statisticsService';
import type { PlayerStatistics } from '../services/statistics/types';
import { useAuthStore } from '../store/authStore';
import { useRemoteResource, type RemoteResource } from './useRemoteResource';

export function usePlayerStatistics(): RemoteResource<PlayerStatistics> {
  const accessToken = useAuthStore((state) => state.accessToken);
  const loader = useMemo(
    () => (accessToken ? () => statisticsService.statistics(accessToken) : null),
    [accessToken],
  );

  return useRemoteResource(loader);
}
