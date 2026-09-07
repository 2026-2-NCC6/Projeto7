import { useCallback, useEffect, useState } from 'react';
import { homeService } from '../services/home/homeService';
import { GUEST_OVERVIEW, type HomeOverview } from '../services/home/types';
import { useAuthStore } from '../store/authStore';
import { toFormErrorMessage } from './formError';

interface HomeOverviewState {
  overview: HomeOverview | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useHomeOverview(): HomeOverviewState {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [overview, setOverview] = useState<HomeOverview | null>(
    accessToken ? null : GUEST_OVERVIEW,
  );
  const [loading, setLoading] = useState(Boolean(accessToken));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setOverview(GUEST_OVERVIEW);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setOverview(await homeService.overview(accessToken));
    } catch (cause) {
      setError(toFormErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  return { overview, loading, error, reload: () => void load() };
}
