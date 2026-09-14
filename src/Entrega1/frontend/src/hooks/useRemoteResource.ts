import { useCallback, useEffect, useState } from 'react';
import { useLevelProgressStore } from '../gameplay/store/levelProgressStore';
import { toFormErrorMessage } from './formError';

export type ResourceLoader<TData> = () => Promise<TData>;

export interface RemoteResource<TData> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface SettledRequest<TData> {
  loader: ResourceLoader<TData>;
  key: string;
  data: TData | null;
  error: string | null;
}

export function useRemoteResource<TData>(
  loader: ResourceLoader<TData> | null,
): RemoteResource<TData> {
  const lastSyncedAt = useLevelProgressStore((state) => state.lastSyncedAt);
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<SettledRequest<TData> | null>(null);
  const key = `${attempt}:${lastSyncedAt}`;

  useEffect(() => {
    if (!loader) {
      return;
    }

    let active = true;

    loader().then(
      (data) => {
        if (active) {
          setSettled({ loader, key, data, error: null });
        }
      },
      (cause: unknown) => {
        if (active) {
          setSettled({ loader, key, data: null, error: toFormErrorMessage(cause) });
        }
      },
    );

    return () => {
      active = false;
    };
  }, [loader, key]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  if (!loader) {
    return { data: null, loading: false, error: null, reload };
  }

  const current = settled?.loader === loader && settled.key === key;

  return {
    data: settled?.data ?? null,
    loading: !current,
    error: current ? settled.error : null,
    reload,
  };
}
