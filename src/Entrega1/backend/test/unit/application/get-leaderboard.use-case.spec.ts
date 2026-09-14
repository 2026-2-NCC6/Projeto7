import { GetLeaderboardUseCase } from '../../../src/application/use-cases/get-leaderboard.use-case';
import { LEADERBOARD_SIZE } from '../../../src/domain/ranking/leaderboard';
import { InMemoryRankingRepository, rankedEntries } from '../../support/fakes';

describe('GetLeaderboardUseCase', () => {
  it('returns an empty board when nobody has scored', async () => {
    const useCase = new GetLeaderboardUseCase(new InMemoryRankingRepository());

    await expect(useCase.execute('xp', null)).resolves.toEqual({
      category: 'xp',
      total: 0,
      entries: [],
      viewer: null,
    });
  });

  it('shows a single ranked player', async () => {
    const useCase = new GetLeaderboardUseCase(
      new InMemoryRankingRepository({ bestScore: rankedEntries(1) }),
    );

    const board = await useCase.execute('bestScore', null);

    expect(board.total).toBe(1);
    expect(board.entries).toEqual([
      { position: 1, name: 'Player 1', value: 100, isViewer: false },
    ]);
  });

  it('never exposes user ids on the public board', async () => {
    const useCase = new GetLeaderboardUseCase(
      new InMemoryRankingRepository({ xp: rankedEntries(3) }),
    );

    const board = await useCase.execute('xp', 'user-2');

    expect(JSON.stringify(board)).not.toContain('user-');
  });

  it('caps the board and flags the viewer inside it', async () => {
    const useCase = new GetLeaderboardUseCase(
      new InMemoryRankingRepository({ xp: rankedEntries(200) }),
    );

    const board = await useCase.execute('xp', 'user-3');

    expect(board.entries).toHaveLength(LEADERBOARD_SIZE);
    expect(board.total).toBe(200);
    expect(board.entries.filter((entry) => entry.isViewer)).toEqual([
      expect.objectContaining({ position: 3 }),
    ]);
    expect(board.viewer).toMatchObject({ position: 3, isViewer: true });
  });

  it('still reports the viewer when ranked below the visible board', async () => {
    const useCase = new GetLeaderboardUseCase(
      new InMemoryRankingRepository({ xp: rankedEntries(200) }),
    );

    const board = await useCase.execute('xp', 'user-134');

    expect(board.entries.some((entry) => entry.isViewer)).toBe(false);
    expect(board.viewer).toEqual({ position: 134, name: 'Player 134', value: 6700, isViewer: true });
  });

  it('has no viewer for guests or players who never scored', async () => {
    const useCase = new GetLeaderboardUseCase(
      new InMemoryRankingRepository({ xp: rankedEntries(5) }),
    );

    expect((await useCase.execute('xp', null)).viewer).toBeNull();
    expect((await useCase.execute('xp', 'newcomer')).viewer).toBeNull();
  });
});
