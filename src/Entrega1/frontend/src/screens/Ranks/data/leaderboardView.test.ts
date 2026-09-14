import { aLeaderboard, rankedPlayers } from '../../../../test/fixtures';
import {
  layoutLeaderboard,
  leaderboardStatusOf,
  podiumOrder,
  viewerStandingOf,
} from './leaderboardView';
import { rankingCategories, rankingCategoryOf } from './rankingCategories';

describe('layoutLeaderboard', () => {
  it('puts the top three on the podium and the rest in rows', () => {
    const layout = layoutLeaderboard(aLeaderboard({ entries: rankedPlayers(8) }));

    expect(layout.podium.map((player) => player.position)).toEqual([1, 2, 3]);
    expect(layout.rows.map((player) => player.position)).toEqual([4, 5, 6, 7, 8]);
  });

  it('handles a board with a single player', () => {
    const layout = layoutLeaderboard(aLeaderboard({ entries: rankedPlayers(1) }));

    expect(layout.podium).toHaveLength(1);
    expect(layout.rows).toEqual([]);
    expect(podiumOrder(layout.podium).map((player) => player.position)).toEqual([1]);
  });

  it('pins the viewer only when they are outside the visible list', () => {
    const listed = aLeaderboard({
      entries: rankedPlayers(50, 7),
      viewer: { position: 7, name: 'Jogador 7', value: 1, isViewer: true },
    });
    const below = aLeaderboard({
      entries: rankedPlayers(50),
      total: 500,
      viewer: { position: 134, name: 'Eu', value: 10, isViewer: true },
    });

    expect(layoutLeaderboard(listed).pinnedViewer).toBeNull();
    expect(layoutLeaderboard(below).pinnedViewer).toMatchObject({ position: 134 });
  });
});

describe('podiumOrder', () => {
  it('places the leader in the middle', () => {
    expect(podiumOrder(rankedPlayers(3)).map((player) => player.position)).toEqual([2, 1, 3]);
    expect(podiumOrder(rankedPlayers(2)).map((player) => player.position)).toEqual([2, 1]);
  });
});

describe('leaderboardStatusOf', () => {
  it('is loading until the selected category arrives', () => {
    expect(leaderboardStatusOf('xp', { data: null, error: null })).toEqual({ kind: 'loading' });
    expect(
      leaderboardStatusOf('bestScore', { data: aLeaderboard({ category: 'xp' }), error: null }),
    ).toEqual({ kind: 'loading' });
  });

  it('reports errors, empty boards and ready boards', () => {
    expect(leaderboardStatusOf('xp', { data: null, error: 'Falhou' })).toEqual({
      kind: 'error',
      message: 'Falhou',
    });
    expect(
      leaderboardStatusOf('xp', { data: aLeaderboard({ entries: [] }), error: null }).kind,
    ).toBe('empty');
    expect(leaderboardStatusOf('xp', { data: aLeaderboard(), error: null }).kind).toBe('ready');
  });
});

describe('viewerStandingOf', () => {
  it('distinguishes guests, unranked, listed and pinned players', () => {
    const viewer = { position: 60, name: 'Eu', value: 1, isViewer: true };

    expect(viewerStandingOf(aLeaderboard(), true)).toBe('guest');
    expect(viewerStandingOf(aLeaderboard(), false)).toBe('unranked');
    expect(
      viewerStandingOf(aLeaderboard({ entries: rankedPlayers(5, 2), viewer }), false),
    ).toBe('listed');
    expect(viewerStandingOf(aLeaderboard({ viewer }), false)).toBe('pinned');
  });
});

describe('ranking categories', () => {
  it('formats each category value with its unit', () => {
    expect(rankingCategoryOf('xp').formatValue(12500)).toBe('12.500 XP');
    expect(rankingCategoryOf('bestScore').formatValue(980)).toBe('980 pts');
    expect(rankingCategoryOf('dailyStreak').formatValue(1)).toBe('1 dia');
    expect(rankingCategoryOf('dailyStreak').formatValue(30)).toBe('30 dias');
    expect(rankingCategories).toHaveLength(6);
  });
});
