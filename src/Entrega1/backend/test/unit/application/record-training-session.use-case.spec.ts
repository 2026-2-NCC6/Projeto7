import { RecordTrainingSessionUseCase } from '../../../src/application/use-cases/record-training-session.use-case';
import { InvalidTrainingSessionError } from '../../../src/domain/training-session/errors';
import { SessionTicket } from '../../../src/application/ports/session-ticket.port';
import {
  InvalidTrainingSessionError as InvalidSession,
  SessionAlreadyRecordedError,
} from '../../../src/domain/training-session/errors';
import {
  aUser,
  InMemoryDailyStreakRepository,
  InMemoryProgressionRepository,
  InMemorySessionTickets,
  InMemoryTrainingSessionRepository,
  InMemoryUserRepository,
  SequentialIdGenerator,
} from '../../support/fakes';

const tickets = new InMemorySessionTickets();

function ticketFor(overrides: Partial<SessionTicket> = {}): string {
  return tickets.issue({
    id: `t-${Math.random()}`,
    userId: 'ana',
    mode: 'level_color',
    level: 1,
    startedAt: new Date(Date.now() - 60_000),
    ...overrides,
  });
}

const baseInput = {
  userId: 'ana',
  ticket: ticketFor(),
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
    tickets,
  );
  return { sessions, useCase };
}

describe('RecordTrainingSessionUseCase telemetry', () => {
  it('records the ticket the session was opened with', async () => {
    const { sessions, useCase } = setup();
    const ticket = ticketFor({ id: 'ticket-a' });

    await useCase.execute({ ...baseInput, ticket });

    expect(sessions.committed[0].session.ticketId).toBe('ticket-a');
  });

  it('defaults to a simulated device with no per-target data', async () => {
    const { sessions, useCase } = setup();

    await useCase.execute({ ...baseInput, ticket: ticketFor() });

    const [{ session }] = sessions.committed;
    expect(session.deviceKind).toBe('simulated');
    expect(session.targets).toEqual([]);
  });

  it('commits per-target telemetry from the wall', async () => {
    const { sessions, useCase } = setup();

    await useCase.execute({
      ...baseInput,
      ticket: ticketFor(),
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
        ticket: ticketFor(),
        targets: [{ targetId: 1, attempts: 20, correctHits: 20 }],
      }),
    ).rejects.toBeInstanceOf(InvalidTrainingSessionError);
    expect(sessions.committed).toEqual([]);
  });
});

describe('RecordTrainingSessionUseCase tickets', () => {
  it.each([
    ['without a ticket the server issued', () => 'forjado'],
    ['with a ticket of another player', () => ticketFor({ userId: 'bia' })],
    ['for another mode than it was opened for', () => ticketFor({ mode: 'level_score' })],
    ['for another level than it was opened for', () => ticketFor({ level: 3 })],
    ['longer than the time since it was opened', () => ticketFor({ startedAt: new Date() })],
  ])('refuses a result %s', async (_case, ticket) => {
    const { sessions, useCase } = setup();

    await expect(useCase.execute({ ...baseInput, ticket: ticket() })).rejects.toBeInstanceOf(
      InvalidSession,
    );
    expect(sessions.committed).toEqual([]);
  });

  it('accepts a result only once per ticket', async () => {
    const { sessions, useCase } = setup();
    const ticket = ticketFor();

    await useCase.execute({ ...baseInput, ticket });

    await expect(useCase.execute({ ...baseInput, ticket })).rejects.toBeInstanceOf(
      SessionAlreadyRecordedError,
    );
    expect(sessions.committed).toHaveLength(1);
  });
});
