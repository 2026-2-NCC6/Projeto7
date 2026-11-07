import { useCallback, useEffect, useRef, useState } from 'react';

export interface Resource<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
  setData: (data: T) => void;
}

export function useResource<T>(load: () => Promise<T>, deps: unknown[]): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);

    load()
      .then((result) => {
        if (current === requestId.current) {
          setData(result);
        }
      })
      .catch((cause: unknown) => {
        if (current === requestId.current) {
          setError(cause instanceof Error ? cause.message : 'Algo deu errado.');
        }
      })
      .finally(() => {
        if (current === requestId.current) {
          setLoading(false);
        }
      });
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { data, error, loading, reload, setData };
}
