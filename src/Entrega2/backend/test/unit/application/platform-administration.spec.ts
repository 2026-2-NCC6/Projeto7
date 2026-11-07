import { Administration } from '../../../src/application/use-cases/administration';
import { GetLeaderboardUseCase } from '../../../src/application/use-cases/get-leaderboard.use-case';
import { TrainingStudio } from '../../../src/application/use-cases/training-studio';
import { UpdateProfileUseCase } from '../../../src/application/use-cases/update-profile.use-case';
import { SessionHistoryRepository } from '../../../src/domain/training-session/session-history';
import { ForbiddenActionError } from '../../../src/domain/user/errors';
import { publicNameOf } from '../../../src/domain/user/practitioner-profile';
import {
  aUser,
  InMemoryAuditLog,
  InMemoryRankingRepository,
  InMemoryStatisticsRepository,
  InMemoryTrainingRepository,
  InMemoryUserRepository,
  SequentialIdGenerator,
} from '../../support/fakes';
import { aTrainingContent } from '../../support/training-fixtures';

const emptyHistory: SessionHistoryRepository = {
  list: async () => ({ items: [], total: 0 }),
  detail: async () => null,
  devices: async () => [],
  operationCounts: async () => ({ emergencyStops: 0, offlineSessions: 0, trainingSessions: 0 }),
};

function setup() {
  const users = new InMemoryUserRepository([
    aUser('admin', 'Admin', 'admin'),
    aUser('coach', 'Coach', 'coach'),
    aUser('ana', 'Ana Maria Souza'),
  ]);
  const trainings = new InMemoryTrainingRepository();
  const audit = new InMemoryAuditLog();
  const statistics = new InMemoryStatisticsRepository();

  return {
    users,
    audit,
    studio: new TrainingStudio(users, trainings, statistics, emptyHistory, new SequentialIdGenerator(), audit),
    administration: new Administration(users, trainings, statistics, emptyHistory, audit),
  };
}

describe('TrainingStudio', () => {
  it('takes a coach draft through review to an admin publication, auditing each step', async () => {
    const { studio, audit } = setup();

    const created = await studio.create('coach', aTrainingContent());
    await studio.simulate('coach', created.id, created.revision, true);
    await studio.submit('coach', created.id);
    const published = await studio.publish('admin', created.id, 'Primeira versão');

    expect(published).toMatchObject({ status: 'published', currentVersion: 1, listed: true });
    expect(published.versions).toHaveLength(1);
    expect(audit.entries.map((entry) => entry.action)).toEqual([
      'training.created',
      'training.simulated',
      'training.submitted',
      'training.published',
    ]);
  });

  it('keeps players out of the studio', async () => {
    const { studio } = setup();

    await expect(studio.list('ana')).rejects.toThrow(ForbiddenActionError);
    await expect(studio.create('ana', aTrainingContent())).rejects.toThrow(ForbiddenActionError);
  });
});

describe('Administration', () => {
  it('promotes a player to coach and records who did it', async () => {
    const { administration, users, audit } = setup();

    await administration.changeRole('admin', 'ana', 'coach');

    expect((await users.findById('ana'))?.role).toBe('coach');
    expect(audit.entries[0]).toMatchObject({
      action: 'user.role_changed',
      actorId: 'admin',
      details: { from: 'player', to: 'coach' },
    });
  });

  it('refuses changes from non-admins and to the admin own role', async () => {
    const { administration } = setup();

    await expect(administration.changeRole('coach', 'ana', 'admin')).rejects.toThrow(ForbiddenActionError);
    await expect(administration.changeRole('admin', 'admin', 'player')).rejects.toThrow(ForbiddenActionError);
  });
});

describe('practitioner profile', () => {
  it('stores the profile and drops duplicated goals and blank restrictions', async () => {
    const { users, audit } = setup();
    const update = new UpdateProfileUseCase(users, audit);

    const view = await update.execute({
      userId: 'ana',
      name: ' Ana Maria Souza ',
      profile: {
        ageGroup: 'teen',
        skillLevel: 'beginner',
        goals: ['fun', 'fun', 'precision'],
        dominantHand: 'left',
        restrictions: '   ',
      },
    });

    expect(view.practitioner).toEqual({
      ageGroup: 'teen',
      skillLevel: 'beginner',
      goals: ['fun', 'precision'],
      dominantHand: 'left',
      restrictions: null,
    });
    expect((await users.findById('ana'))?.isMinor).toBe(true);
  });

  it('shows only the first name and an initial of a minor in public rankings', async () => {
    const leaderboard = new GetLeaderboardUseCase(
      new InMemoryRankingRepository({
        xp: [
          { position: 1, userId: 'ana', name: 'Ana Maria Souza', minor: true, value: 900 },
          { position: 2, userId: 'bia', name: 'Bia Lopes', minor: false, value: 800 },
        ],
      }),
    );

    const view = await leaderboard.execute('xp', null);

    expect(view.entries.map((entry) => entry.name)).toEqual(['Ana S.', 'Bia Lopes']);
    expect(publicNameOf('Ana', true)).toBe('Ana');
  });
});
