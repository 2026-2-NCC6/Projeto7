import {
  ACTIVITY_WINDOW_DAYS,
  GetPlayerStatisticsUseCase,
  RECENT_SESSIONS_LIMIT,
} from '../../../src/application/use-cases/get-player-statistics.use-case';
import { DailyStreak } from '../../../src/domain/daily-streak/daily-streak.entity';
import { Progression } from '../../../src/domain/progression/progression.entity';
import { RecentSession } from '../../../src/domain/statistics/training-statistics';
import { UserNotFoundError } from '../../../src/domain/user/errors';
import {
  aUser,
  EMPTY_SUMMARY,
  InMemoryDailyStreakRepository,
  InMemoryProgressionRepository,
  InMemoryRankingRepository,
  InMemoryStatisticsRepository,
  InMemoryUserRepository,
  rankedEntries,
} from '../../support/fakes';

const today = new Date('2026-09-14T10:00:00.000Z');

function recentSession(index: number): RecentSession {
  return {
    id: `session-${index}`,
    mode: 'level_color',
    level: 1,
    cleared: true,
    score: 100,
    accuracyPercent: 90,
    durationMs: 1000,
    deviceKind: 'simulated',
    playedAt: today,
  };
}

describe('GetPlayerStatisticsUseCase', () => {
  it('rejects an unknown player', async () => {
    const useCase = new GetPlayerStatisticsUseCase(
      new InMemoryUserRepository(),
      new InMemoryProgressionRepository(),
      new InMemoryDailyStreakRepository(),
      new InMemoryStatisticsRepository(),
      new InMemoryRankingRepository(),
      () => today,
    );

    await expect(useCase.execute('ghost')).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('gives a player with no sessions complete, empty statistics', async () => {
    const statistics = new InMemoryStatisticsRepository();
    const useCase = new GetPlayerStatisticsUseCase(
      new InMemoryUserRepository([aUser('ana', 'Ana')]),
      new InMemoryProgressionRepository(),
      new InMemoryDailyStreakRepository(),
      statistics,
      new InMemoryRankingRepository(),
      () => today,
    );

    const view = await useCase.execute('ana');

    expect(view.player).toEqual({
      name: 'Ana',
      level: 0,
      memberSince: new Date('2026-01-10T12:00:00.000Z'),
    });
    expect(view.summary).toEqual(EMPTY_SUMMARY);
    expect(view.modes).toHaveLength(4);
    expect(view.targets).toHaveLength(9);
    expect(view.activity).toHaveLength(ACTIVITY_WINDOW_DAYS);
    expect(view.recentSessions).toEqual([]);
    expect(view.streak).toEqual({ current: 0, longest: 0 });
    expect(view.rank).toBeNull();
    expect(statistics.scopes).toEqual([{ kind: 'player', userId: 'ana' }]);
    expect(statistics.since?.toISOString()).toBe('2026-08-16T00:00:00.000Z');
  });

  it('merges partial telemetry with progression, streak and rank', async () => {
    const useCase = new GetPlayerStatisticsUseCase(
      new InMemoryUserRepository([aUser('user-2')]),
      new InMemoryProgressionRepository([
        Progression.restore({ userId: 'user-2', track: 'color', level: 4, xp: 120 }),
      ]),
      new InMemoryDailyStreakRepository([
        DailyStreak.restore({
          userId: 'user-2',
          currentStreak: 3,
          longestStreak: 8,
          lastCompletedOn: '2026-09-14',
        }),
      ]),
      new InMemoryStatisticsRepository({
        summary: { ...EMPTY_SUMMARY, sessions: 12, hits: 40, misses: 10, accuracyPercent: 80 },
        modes: [],
        activity: [{ day: '2026-09-14', sessions: 12, score: 999, accuracyPercent: 80 }],
        targets: [
          {
            targetId: 7,
            attempts: 10,
            correctHits: 8,
            accuracyPercent: 80,
            impactAverage: null,
            impactPeak: null,
          },
        ],
        recentSessions: Array.from({ length: 25 }, (_, index) => recentSession(index)),
      }),
      new InMemoryRankingRepository({ xp: rankedEntries(40) }),
      () => today,
    );

    const view = await useCase.execute('user-2');

    expect(view.player.level).toBe(4);
    expect(view.progress).toEqual([{ track: 'color', level: 4, xp: 120, xpRequired: 1500 }]);
    expect(view.streak).toEqual({ current: 3, longest: 8 });
    expect(view.rank).toEqual({ position: 2, total: 40 });
    expect(view.activity[ACTIVITY_WINDOW_DAYS - 1].sessions).toBe(12);
    expect(view.targets[6].attempts).toBe(10);
    expect(view.targets[0].attempts).toBe(0);
    expect(view.recentSessions).toHaveLength(RECENT_SESSIONS_LIMIT);
  });
});
