import type { SessionMetrics, TargetMetrics } from '../domain/metrics/session-metrics';
import type { SessionResult } from '../domain/metrics/session-result';
import { toRecordSessionRequest } from './sessionService';

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
          target({ targetId: 9, color: 'blue', attempts: 2, correctHits: 2 }),
        ],
        'websocket',
      ),
    );

    expect(request).toMatchObject({
      deviceKind: 'websocket',
      score: 900,
      durationMs: 30_401,
      avgResponseMs: 612,
      bestResponseMs: 301,
      targets: [
        { targetId: 1, attempts: 4, correctHits: 3, impactAverage: 1500, impactPeak: 2900 },
        { targetId: 9, attempts: 2, correctHits: 2, impactAverage: null, impactPeak: null },
      ],
    });
  });

  it('never persists simulated impact readings', () => {
    const request = toRecordSessionRequest(
      resultWith([target({ attempts: 3, correctHits: 3, impact: impact(true) })], 'simulated'),
    );

    expect(request.targets).toEqual([
      { targetId: 1, attempts: 3, correctHits: 3, impactAverage: null, impactPeak: null },
    ]);
  });
});
