import { RecordOfflineSessionUseCase } from '../../../src/application/use-cases/record-offline-session.use-case';
import { RecordTrainingSessionUseCase } from '../../../src/application/use-cases/record-training-session.use-case';
import { StartTrainingSessionUseCase } from '../../../src/application/use-cases/start-training-session.use-case';
import { TrainingNotFoundError } from '../../../src/domain/training/errors';
import { Actor, Training } from '../../../src/domain/training/training.entity';
import {
  InvalidTrainingSessionError,
  SessionAlreadyRecordedError,
} from '../../../src/domain/training-session/errors';
import {
  aUser,
  InMemoryAuditLog,
  InMemoryDailyStreakRepository,
  InMemoryProgressionRepository,
  InMemorySessionTickets,
  InMemoryTrainingRepository,
  InMemoryTrainingSessionRepository,
  InMemoryUserRepository,
  SequentialIdGenerator,
} from '../../support/fakes';
import { aTrainingContent } from '../../support/training-fixtures';

const admin: Actor = { id: 'admin', role: 'admin' };
const now = new Date();
const step = { id: 'training-1', version: 1, stepIndex: 0 };

async function setup() {
  const users = new InMemoryUserRepository([aUser('ana'), aUser('admin', 'Admin', 'admin')]);
  const trainings = new InMemoryTrainingRepository();
  const sessions = new InMemoryTrainingSessionRepository();
  const tickets = new InMemorySessionTickets();
  const ids = new SequentialIdGenerator();
  const audit = new InMemoryAuditLog();

  const { training, version } = Training.create({
    id: 'training-1',
    author: admin,
    content: aTrainingContent(),
    now,
  })
    .recordSimulation(admin, 1, true, now)
    .publish(admin, 'v1', now);
  await trainings.publish(training, version);

  return {
    sessions,
    audit,
    start: new StartTrainingSessionUseCase(users, sessions, tickets, ids, trainings),
    record: new RecordTrainingSessionUseCase(
      users,
      new InMemoryProgressionRepository(),
      new InMemoryDailyStreakRepository(),
      sessions,
      ids,
      tickets,
      audit,
    ),
    offline: new RecordOfflineSessionUseCase(users, sessions, trainings, ids, audit),
  };
}

const result = {
  userId: 'ana',
  mode: 'level_color' as const,
  level: 0,
  cleared: true,
  score: 60,
  hits: 5,
  misses: 1,
  bestStreak: 5,
  durationMs: 2000,
};

describe('training step sessions', () => {
  it('opens a published step regardless of the level ladder and records it against the training', async () => {
    const { start, record, sessions } = await setup();
    const { ticket } = await start.execute({ userId: 'ana', mode: 'level_color', level: 0, training: step });

    await record.execute({ ...result, ticket, training: step });

    expect(sessions.committed[0].session.training).toEqual(step);
    expect(sessions.committed[0].session.endReason).toBe('cleared');
  });

  it('refuses a step whose mode does not match, and an unknown training', async () => {
    const { start } = await setup();

    await expect(
      start.execute({ userId: 'ana', mode: 'level_score', level: 0, training: step }),
    ).rejects.toThrow(InvalidTrainingSessionError);
    await expect(
      start.execute({ userId: 'ana', mode: 'level_color', level: 0, training: { ...step, version: 9 } }),
    ).rejects.toThrow(TrainingNotFoundError);
  });

  it('refuses a result that claims another training than the ticket', async () => {
    const { start, record } = await setup();
    const { ticket } = await start.execute({ userId: 'ana', mode: 'level_color', level: 0, training: step });

    await expect(
      record.execute({ ...result, ticket, training: { ...step, stepIndex: 1 } }),
    ).rejects.toThrow(InvalidTrainingSessionError);
  });

  it('pays no XP for an emergency stop and audits the reason', async () => {
    const { start, record, sessions, audit } = await setup();
    const { ticket } = await start.execute({ userId: 'ana', mode: 'level_color', level: 0, training: step });

    const recorded = await record.execute({
      ...result,
      cleared: false,
      ticket,
      training: step,
      endReason: 'emergencyStop',
      stopReason: 'Criança entrou na área de rebote',
    });

    expect(recorded.xpAwarded).toBe(0);
    expect(sessions.committed[0].session.stopReason).toBe('Criança entrou na área de rebote');
    expect(audit.entries.map((entry) => entry.action)).toEqual(['session.emergency_stop']);
  });
});

describe('RecordOfflineSessionUseCase', () => {
  const offlineResult = {
    ...result,
    durationMs: 30_000,
    clientSessionId: '9b2f8c52-4a0e-4b8e-9d4a-6c1e2f3a4b5c',
    playedAt: new Date(Date.now() - 60_000),
    training: step,
    attempts: [{ atMs: 1000, responseMs: 800, verdict: 'correct' as const, targetId: 1, scoreDelta: 12 }],
  };

  it('stores the session as offline, without XP, with its attempts', async () => {
    const { offline, sessions } = await setup();

    const view = await offline.execute(offlineResult);

    expect(view).toMatchObject({ xpAwarded: 0, offline: true });
    expect(sessions.offline[0].offline).toBe(true);
    expect(sessions.offline[0].attempts[0]).toMatchObject({ targetId: 1, intensity: null });
  });

  it('accepts each client session once', async () => {
    const { offline } = await setup();

    await offline.execute(offlineResult);
    await expect(offline.execute(offlineResult)).rejects.toThrow(SessionAlreadyRecordedError);
  });

  it('refuses sessions from the future or older than the sync window', async () => {
    const { offline } = await setup();

    await expect(
      offline.execute({ ...offlineResult, playedAt: new Date(Date.now() + 60 * 60_000) }),
    ).rejects.toThrow(InvalidTrainingSessionError);
    await expect(
      offline.execute({ ...offlineResult, playedAt: new Date('2020-01-01T00:00:00.000Z') }),
    ).rejects.toThrow(InvalidTrainingSessionError);
  });
});
