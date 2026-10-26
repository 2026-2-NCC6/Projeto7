import { StartTrainingSessionUseCase } from '../../../src/application/use-cases/start-training-session.use-case';
import { InvalidTrainingSessionError } from '../../../src/domain/training-session/errors';
import { EMPTY_SESSION_INSIGHTS } from '../../../src/domain/training-session/session-insights';
import { UserNotFoundError } from '../../../src/domain/user/errors';
import {
  aUser,
  InMemorySessionTickets,
  InMemoryTrainingSessionRepository,
  InMemoryUserRepository,
  SequentialIdGenerator,
} from '../../support/fakes';

function setup(highestColorCleared = 0) {
  const tickets = new InMemorySessionTickets();
  const useCase = new StartTrainingSessionUseCase(
    new InMemoryUserRepository([aUser('ana')]),
    new InMemoryTrainingSessionRepository({
      ...EMPTY_SESSION_INSIGHTS,
      highestClearedByMode: { ...EMPTY_SESSION_INSIGHTS.highestClearedByMode, level_color: highestColorCleared },
    }),
    tickets,
    new SequentialIdGenerator(),
  );
  return { tickets, useCase };
}

describe('StartTrainingSessionUseCase', () => {
  it('issues a ticket that names the player, the level and the server time', async () => {
    const { tickets, useCase } = setup(2);
    const before = Date.now();

    const { ticket, startedAt } = await useCase.execute({
      userId: 'ana',
      mode: 'level_color',
      level: 3,
    });

    expect(tickets.verify(ticket)).toMatchObject({
      id: 'id-1',
      userId: 'ana',
      mode: 'level_color',
      level: 3,
    });
    expect(new Date(startedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it('refuses a level past the next one to clear', async () => {
    const { useCase } = setup(2);

    await expect(
      useCase.execute({ userId: 'ana', mode: 'level_color', level: 4 }),
    ).rejects.toBeInstanceOf(InvalidTrainingSessionError);
  });

  it('opens an endless run only at level zero', async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ userId: 'ana', mode: 'infinite_score', level: 0 }),
    ).resolves.toHaveProperty('ticket');
    await expect(
      useCase.execute({ userId: 'ana', mode: 'infinite_score', level: 5 }),
    ).rejects.toBeInstanceOf(InvalidTrainingSessionError);
  });

  it('refuses a player that does not exist', async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ userId: 'fantasma', mode: 'level_color', level: 1 }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
