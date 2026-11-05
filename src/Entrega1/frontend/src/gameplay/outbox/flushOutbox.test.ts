import { ApiError, post } from '../../services/api/httpClient';
import { flushOutbox } from './flushOutbox';
import { useOutboxStore, type PendingSession } from './outboxStore';

jest.mock('../../services/api/httpClient', () => ({
  ...jest.requireActual('../../services/api/httpClient'),
  post: jest.fn(),
}));

const request = {
  mode: 'level_color' as const,
  level: 1,
  cleared: true,
  score: 40,
  hits: 4,
  misses: 0,
  bestStreak: 4,
  durationMs: 9000,
  deviceKind: 'simulated' as const,
  targets: [],
  interruptions: { pauses: 0, deviceLosses: 0, faults: 0 },
  attempts: [],
};

function pending(id: string, ticket: string | null): PendingSession {
  return { clientSessionId: id, ticket, playedAt: '2026-11-04T12:00:00.000Z', request };
}

describe('flushOutbox', () => {
  beforeEach(() => {
    jest.mocked(post).mockReset();
    useOutboxStore.setState({ pending: [] });
  });

  it('sends a session opened online with its ticket and one opened offline to the offline route', async () => {
    useOutboxStore.setState({ pending: [pending('a', 'ticket-a'), pending('b', null)] });
    jest.mocked(post).mockResolvedValue({});

    await expect(flushOutbox('token')).resolves.toBe(2);

    expect(post).toHaveBeenNthCalledWith(1, '/me/sessions', expect.objectContaining({ ticket: 'ticket-a' }), 'token');
    expect(post).toHaveBeenNthCalledWith(
      2,
      '/me/sessions/offline',
      expect.objectContaining({ clientSessionId: 'b', playedAt: '2026-11-04T12:00:00.000Z' }),
      'token',
    );
    expect(useOutboxStore.getState().pending).toEqual([]);
  });

  it('falls back to the offline route when the ticket is no longer accepted', async () => {
    useOutboxStore.setState({ pending: [pending('a', 'expired')] });
    jest
      .mocked(post)
      .mockRejectedValueOnce(new ApiError('A sessão não foi iniciada no servidor.', 400))
      .mockResolvedValueOnce({});

    await flushOutbox('token');

    expect(post).toHaveBeenLastCalledWith('/me/sessions/offline', expect.objectContaining({ clientSessionId: 'a' }), 'token');
    expect(useOutboxStore.getState().pending).toEqual([]);
  });

  it('keeps everything queued while there is still no connection', async () => {
    useOutboxStore.setState({ pending: [pending('a', null), pending('b', null)] });
    jest.mocked(post).mockRejectedValue(new ApiError('Não foi possível conectar ao servidor.', 0));

    await expect(flushOutbox('token')).resolves.toBe(0);

    expect(useOutboxStore.getState().pending).toHaveLength(2);
    expect(post).toHaveBeenCalledTimes(1);
  });
});
