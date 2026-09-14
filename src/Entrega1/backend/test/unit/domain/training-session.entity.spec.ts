import { InvalidTrainingSessionError } from '../../../src/domain/training-session/errors';
import { TargetPerformance } from '../../../src/domain/training-session/target-performance';
import {
  TrainingSession,
  TrainingSessionProps,
} from '../../../src/domain/training-session/training-session.entity';

function recordWith(overrides: Partial<Omit<TrainingSessionProps, 'playedAt'>>): TrainingSession {
  return TrainingSession.record({
    id: 'session-1',
    userId: 'user-1',
    mode: 'level_color',
    level: 1,
    cleared: true,
    score: 500,
    hits: 8,
    misses: 2,
    bestStreak: 5,
    durationMs: 30_000,
    avgResponseMs: 600,
    bestResponseMs: 300,
    xpAwarded: 120,
    deviceKind: 'simulated',
    targets: [],
    ...overrides,
  });
}

function target(overrides: Partial<TargetPerformance>): TargetPerformance {
  return {
    targetId: 1,
    attempts: 1,
    correctHits: 1,
    impactAverage: null,
    impactPeak: null,
    ...overrides,
  };
}

describe('TrainingSession.record', () => {
  it('accepts a session without per-target data', () => {
    const session = recordWith({});

    expect(session.targets).toEqual([]);
    expect(session.deviceKind).toBe('simulated');
  });

  it('keeps consistent per-target telemetry', () => {
    const targets = [
      target({ targetId: 1, attempts: 5, correctHits: 4, impactAverage: 1800, impactPeak: 4095 }),
      target({ targetId: 9, attempts: 5, correctHits: 4 }),
    ];

    const session = recordWith({ deviceKind: 'websocket', targets });

    expect(session.targets).toEqual(targets);
    expect(session.deviceKind).toBe('websocket');
  });

  it.each([
    ['a target off the wall', [target({ targetId: 10 })]],
    ['a repeated target', [target({ targetId: 2 }), target({ targetId: 2 })]],
    ['more hits than attempts', [target({ attempts: 1, correctHits: 2 })]],
    ['an impact above the ADC range', [target({ impactPeak: 4096 })]],
    ['more target misses than session misses', [target({ attempts: 5, correctHits: 1 })]],
    ['more target hits than session hits', [target({ attempts: 9, correctHits: 9 })]],
    ['more target attempts than session attempts', [target({ attempts: 11, correctHits: 1 })]],
  ])('rejects %s', (_reason, targets) => {
    expect(() => recordWith({ targets })).toThrow(InvalidTrainingSessionError);
  });
});
