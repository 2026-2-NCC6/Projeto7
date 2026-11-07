import { GetProfileUseCase } from '../../../src/application/use-cases/get-profile.use-case';
import {
  aUser,
  InMemoryDailyStreakRepository,
  InMemoryProgressionRepository,
  InMemoryRankingRepository,
  InMemoryTrainingSessionRepository,
  InMemoryUserRepository,
  rankedEntries,
} from '../../support/fakes';

function profileFor(board: InMemoryRankingRepository, userId: string) {
  return new GetProfileUseCase(
    new InMemoryUserRepository([aUser(userId)]),
    new InMemoryProgressionRepository(),
    new InMemoryDailyStreakRepository(),
    new InMemoryTrainingSessionRepository(),
    board,
  ).execute(userId);
}

function rankAchievements(achievements: { id: string; unlocked: boolean }[]) {
  return Object.fromEntries(
    achievements
      .filter((achievement) => achievement.id.startsWith('rank_'))
      .map((achievement) => [achievement.id, achievement.unlocked]),
  );
}

describe('GetProfileUseCase ranking', () => {
  it('keeps rank empty and rank achievements locked for an unranked player', async () => {
    const profile = await profileFor(new InMemoryRankingRepository(), 'newcomer');

    expect(profile.rank).toBeNull();
    expect(rankAchievements(profile.achievements)).toEqual({
      rank_top_100: false,
      rank_top_10: false,
      rank_first: false,
    });
  });

  it('fills the rank from the XP board and unlocks what the position earns', async () => {
    const profile = await profileFor(
      new InMemoryRankingRepository({ xp: rankedEntries(150) }),
      'user-7',
    );

    expect(profile.rank).toEqual({ position: 7, total: 150 });
    expect(rankAchievements(profile.achievements)).toEqual({
      rank_top_100: true,
      rank_top_10: true,
      rank_first: false,
    });
  });

  it('unlocks the legend achievement for the leader', async () => {
    const profile = await profileFor(
      new InMemoryRankingRepository({ xp: rankedEntries(3) }),
      'user-1',
    );

    expect(rankAchievements(profile.achievements).rank_first).toBe(true);
  });
});
