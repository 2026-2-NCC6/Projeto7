import { useEffect, useState } from 'react';
import { toFormErrorMessage } from '../../hooks/formError';
import { useAuthStore } from '../../store/authStore';
import type { SessionResult } from '../domain/metrics/session-result';
import { sessionService } from '../services/sessionService';
import type { RecordedSession } from '../services/types';
import { useLevelProgressStore } from '../store/levelProgressStore';

export type RecordStatus = 'idle' | 'saving' | 'saved' | 'queued' | 'guest' | 'error';

export interface RecordSessionState {
  status: RecordStatus;
  recorded: RecordedSession | null;
  error: string | null;
}

export function useRecordSession(result: SessionResult | null): RecordSessionState {
  const accessToken = useAuthStore((state) => state.accessToken);
  const recordResult = useLevelProgressStore((state) => state.recordResult);
  const markSynced = useLevelProgressStore((state) => state.markSynced);
  const [state, setState] = useState<RecordSessionState>({
    status: 'idle',
    recorded: null,
    error: null,
  });

  useEffect(() => {
    if (!result) {
      return;
    }

    if (!result.training) {
      recordResult(result);
    }

    if (!accessToken) {
      setState({ status: 'guest', recorded: null, error: null });
      markSynced();
      return;
    }

    let active = true;
    setState({ status: 'saving', recorded: null, error: null });

    sessionService
      .record(result, accessToken)
      .then((outcome) => {
        if (!active) {
          return;
        }
        if (outcome.kind === 'queued') {
          setState({ status: 'queued', recorded: null, error: null });
        } else {
          setState({ status: 'saved', recorded: outcome.recorded, error: null });
          // Only now does the server know about the session, so this is the
          // earliest point at which refetching Home or Profile is meaningful.
          markSynced();
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({ status: 'error', recorded: null, error: toFormErrorMessage(cause) });
        }
      });

    return () => {
      active = false;
    };
  }, [result, accessToken, recordResult, markSynced]);

  return state;
}
