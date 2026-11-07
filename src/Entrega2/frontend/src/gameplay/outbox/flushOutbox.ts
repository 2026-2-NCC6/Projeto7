import { endpoints } from '../../services/api/endpoints';
import { ApiError, post } from '../../services/api/httpClient';
import { useOutboxStore, type PendingSession } from './outboxStore';

const NETWORK_UNAVAILABLE = 0;
const ALREADY_RECORDED = 409;

function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === NETWORK_UNAVAILABLE;
}

async function sendOffline(session: PendingSession, accessToken: string): Promise<void> {
  await post(
    endpoints.recordOfflineSession,
    { ...session.request, clientSessionId: session.clientSessionId, playedAt: session.playedAt },
    accessToken,
  );
}

async function send(session: PendingSession, accessToken: string): Promise<void> {
  if (!session.ticket) {
    return sendOffline(session, accessToken);
  }

  try {
    await post(endpoints.recordSession, { ...session.request, ticket: session.ticket }, accessToken);
  } catch (error) {
    if (isNetworkError(error) || (error instanceof ApiError && error.status === ALREADY_RECORDED)) {
      throw error;
    }
    await sendOffline(session, accessToken);
  }
}

export async function flushOutbox(accessToken: string): Promise<number> {
  const { pending, remove } = useOutboxStore.getState();
  let delivered = 0;

  for (const session of pending) {
    try {
      await send(session, accessToken);
      delivered += 1;
      remove(session.clientSessionId);
    } catch (error) {
      if (isNetworkError(error)) {
        break;
      }
      remove(session.clientSessionId);
    }
  }

  return delivered;
}

export { isNetworkError };
