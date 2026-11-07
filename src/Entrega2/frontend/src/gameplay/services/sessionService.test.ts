import type { SessionMetrics, TargetMetrics } from '../domain/metrics/session-metrics';
import type { SessionResult } from '../domain/metrics/session-result';
import { ApiError, post } from '../../services/api/httpClient';
import { useOutboxStore } from '../outbox/outboxStore';
import { sessionService, toRecordSessionRequest } from './sessionService';

jest.mock('../../services/api/httpClient', () => ({
  ...jest.requireActual('../../services/api/httpClient'),
  post: jest.fn(),
}));

function target(overrides: Partial<TargetMetrics>): TargetMetrics {
  return { targetId: 1, color: 'amber', attempts: 0, correctHits: 0, impact: null, ...overrides };
}

function resultWith(perTarget: TargetMetrics[], deviceKind: SessionResult['deviceKind']): SessionResult {
  const metrics: SessionMetrics = {
    level: 2,
    durationMs: 30_400.6,
    totalAttempts: 6,
    correctHits: 5,
    incorrectHits: 1,
    accuracyPercent: 83,
    longestCorrectStreak: 4,
    finalScore: 900.4,
    completionPercent: 100,
    response: { averageMs: 612.3, fastestMs: 301, slowestMs: 900 },
    perTarget,
    impact: null,
  };

  return {
    mode: 'level_color',
    level: 2,
    cleared: true,
    failureReason: null,
    startedAt: 0,
    endedAt: 30_000,
    deviceKind,
    metrics,
    training: null,
    stopReason: null,
    interruptions: { pauses: 0, deviceLosses: 0, faults: 0 },
    deviceId: null,
    records: [],
  };
}

const impact = (simulated: boolean) => ({
  averageRaw: 1500,
  maxRaw: 2900,
  minRaw: 800,
  consistencyPercent: 70,
  simulated,
});

describe('toRecordSessionRequest', () => {
  it('sends the device kind and only the targets that were hit', () => {
    const request = toRecordSessionRequest(
      resultWith(
        [
          target({ targetId: 1, attempts: 4, correctHits: 3, impact: impact(false) }),
          target({ targetId: 2 }),
          target({ targetId: 6, color: 'blue', attempts: 2, correctHits: 2 }),
        ],
        'websocket',
      ),
      'ticket-1',
    );

    expect(request).toMatchObject({
      ticket: 'ticket-1',
      deviceKind: 'websocket',
      score: 900,
      durationMs: 30_401,
      avgResponseMs: 612,
      bestResponseMs: 301,
      targets: [
        { targetId: 1, attempts: 4, correctHits: 3, impactAverage: 1500, impactPeak: 2900 },
        { targetId: 6, attempts: 2, correctHits: 2, impactAverage: null, impactPeak: null },
      ],
    });
  });

  it('never persists simulated impact readings', () => {
    const request = toRecordSessionRequest(
      resultWith([target({ attempts: 3, correctHits: 3, impact: impact(true) })], 'simulated'),
      'ticket-1',
    );

    expect(request.targets).toEqual([
      { targetId: 1, attempts: 3, correctHits: 3, impactAverage: null, impactPeak: null },
    ]);
  });
});

describe('sessionService', () => {
  const result = resultWith([], 'simulated');

  beforeEach(() => jest.mocked(post).mockReset());

  it('records the result with the ticket the session was opened with', async () => {
    jest
      .mocked(post)
      .mockResolvedValueOnce({ ticket: 'ticket-9', startedAt: '2026-10-25T12:00:00.000Z' })
      .mockResolvedValueOnce({ xpAwarded: 120 });

    sessionService.open({ mode: 'level_color', level: 2 }, result.startedAt, 'token');
    await sessionService.record(result, 'token');

    expect(post).toHaveBeenNthCalledWith(
      1,
      '/me/sessions/start',
      { mode: 'level_color', level: 2 },
      'token',
    );
    expect(post).toHaveBeenNthCalledWith(
      2,
      '/me/sessions',
      expect.objectContaining({ ticket: 'ticket-9' }),
      'token',
    );
  });

  it('refuses to record a session that was never opened', async () => {
    jest.mocked(post).mockResolvedValueOnce({ ticket: 'ticket-1', startedAt: '' });
    sessionService.open({ mode: 'level_color', level: 2 }, 1, 'token');

    await expect(sessionService.record({ ...result, startedAt: 2 }, 'token')).rejects.toThrow(
      'não foi aberta no servidor',
    );
  });

  it('reports why the session could not be opened', async () => {
    jest.mocked(post).mockRejectedValueOnce(new Error('Não foi possível conectar ao servidor.'));

    sessionService.open({ mode: 'level_color', level: 2 }, result.startedAt, 'token');

    await expect(sessionService.record(result, 'token')).rejects.toThrow('conectar ao servidor');
  });

  it('keeps the result on the phone when the network fails after the session was opened', async () => {
    useOutboxStore.setState({ pending: [] });
    jest
      .mocked(post)
      .mockResolvedValueOnce({ ticket: 'ticket-7', startedAt: '' })
      .mockRejectedValueOnce(new ApiError('Não foi possível conectar ao servidor.', 0));

    sessionService.open({ mode: 'level_color', level: 2 }, result.startedAt, 'token');

    await expect(sessionService.record(result, 'token')).resolves.toEqual({ kind: 'queued' });
    expect(useOutboxStore.getState().pending).toEqual([
      expect.objectContaining({ ticket: 'ticket-7', request: expect.objectContaining({ score: 900 }) }),
    ]);
  });
});

describe('toSessionResultRequest telemetry', () => {
  it('sends the training step, the stop reason, interruptions and each attempt', () => {
    const request = toRecordSessionRequest(
      {
        ...resultWith([], 'websocket'),
        cleared: false,
        failureReason: 'emergencyStop',
        training: { id: 'training-1', version: 2, stepIndex: 1 },
        stopReason: 'Pessoa ou objeto na área de jogo',
        interruptions: { pauses: 1, deviceLosses: 2, faults: 0 },
        deviceId: 'smash-wall',
        records: [
          { atMs: 1200.4, responseMs: 800.6, verdict: 'correct', targetId: 3, color: 'red', scoreDelta: 12, impact: { raw: 2100, simulated: false } },
          { atMs: 2400, responseMs: 1000, verdict: 'incorrect', targetId: null, color: null, scoreDelta: 0, impact: null },
        ],
      },
      'ticket-1',
    );

    expect(request).toMatchObject({
      training: { id: 'training-1', version: 2, stepIndex: 1 },
      endReason: 'emergencyStop',
      stopReason: 'Pessoa ou objeto na área de jogo',
      interruptions: { pauses: 1, deviceLosses: 2, faults: 0 },
      deviceId: 'smash-wall',
      attempts: [
        { atMs: 1200, responseMs: 801, verdict: 'correct', targetId: 3, scoreDelta: 12, intensity: 2100 },
        { atMs: 2400, responseMs: 1000, verdict: 'incorrect', targetId: null, scoreDelta: 0, intensity: null },
      ],
    });
  });
});

