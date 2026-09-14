import { RecordTrainingSessionUseCase } from '../../../src/application/use-cases/record-training-session.use-case';
import { InvalidTrainingSessionError } from '../../../src/domain/training-session/errors';
import {
  aUser,
  InMemoryDailyStreakRepository,
  InMemoryProgressionRepository,
  InMemoryTrainingSessionRepository,
  InMemoryUserRepository,
  SequentialIdGenerator,
} from '../../support/fakes';

const baseInput = {
  userId: 'ana',
  mode: 'level_color' as const,
  level: 1,
  cleared: true,
  score: 400,
  hits: 6,
  misses: 1,
  bestStreak: 4,
  durationMs: 20_000,
};

function setup() {
  const sessions = new InMemoryTrainingSessionRepository();
  const useCase = new RecordTrainingSessionUseCase(
    new InMemoryUserRepository([aUser('ana')]),
    new InMemoryProgressionRepository(),
    new InMemoryDailyStreakRepository(),
    sessions,
    new SequentialIdGenerator(),
  );
  return { sessions, useCase };
}

describe('RecordTrainingSessionUseCase telemetry', () => {
  it('defaults to a simulated device with no per-target data', async () => {
    const { sessions, useCase } = setup();

    await useCase.execute(baseInput);

    const [{ session }] = sessions.committed;
    expect(session.deviceKind).toBe('simulated');
    expect(session.targets).toEqual([]);
  });

  it('commits per-target telemetry from the wall', async () => {
    const { sessions, useCase } = setup();

    await useCase.execute({
      ...baseInput,
      deviceKind: 'websocket',
      targets: [
        { targetId: 2, attempts: 4, correctHits: 4, impactAverage: 2100, impactPeak: 3900 },
        { targetId: 6, attempts: 3, correctHits: 2 },
      ],
    });

    const [{ session }] = sessions.committed;
    expect(session.deviceKind).toBe('websocket');
    expect(session.targets).toEqual([
      { targetId: 2, attempts: 4, correctHits: 4, impactAverage: 2100, impactPeak: 3900 },
      { targetId: 6, attempts: 3, correctHits: 2, impactAverage: null, impactPeak: null },
    ]);
  });

  it('commits nothing when the targets contradict the session totals', async () => {
    const { sessions, useCase } = setup();

    await expect(
      useCase.execute({
        ...baseInput,
        targets: [{ targetId: 1, attempts: 20, correctHits: 20 }],
      }),
    ).rejects.toBeInstanceOf(InvalidTrainingSessionError);
    expect(sessions.committed).toEqual([]);
  });
});
