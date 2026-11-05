import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useLevelProgressStore } from '../store/levelProgressStore';
import { flushOutbox } from './flushOutbox';
import { useOutboxStore } from './outboxStore';

const RETRY_MS = 30_000;

export function useOutboxSync(): number {
  const accessToken = useAuthStore((state) => state.accessToken);
  const pending = useOutboxStore((state) => state.pending.length);
  const markSynced = useLevelProgressStore((state) => state.markSynced);

  useEffect(() => {
    if (!accessToken || pending === 0) {
      return;
    }

    let running = false;
    const attempt = () => {
      if (running) {
        return;
      }
      running = true;
      flushOutbox(accessToken)
        .then((delivered) => {
          if (delivered > 0) {
            markSynced();
          }
        })
        .finally(() => {
          running = false;
        });
    };

    attempt();
    const timer = setInterval(attempt, RETRY_MS);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        attempt();
      }
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [accessToken, pending, markSynced]);

  return pending;
}
