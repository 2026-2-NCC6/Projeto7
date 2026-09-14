import { useCallback } from 'react';
import { rankingService } from '../services/ranking/rankingService';
import type { Leaderboard, RankingCategory } from '../services/ranking/types';
import { useAuthStore } from '../store/authStore';
import { useRemoteResource, type RemoteResource } from './useRemoteResource';

export function useLeaderboard(category: RankingCategory): RemoteResource<Leaderboard> {
  const accessToken = useAuthStore((state) => state.accessToken);
  const loader = useCallback(
    () => rankingService.leaderboard(category, accessToken),
    [category, accessToken],
  );

  return useRemoteResource(loader);
}
