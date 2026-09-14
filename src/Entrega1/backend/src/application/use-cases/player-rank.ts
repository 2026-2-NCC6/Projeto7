import { PROFILE_RANKING_CATEGORY } from '../../domain/ranking/ranking-category';
import { RankingRepository } from '../../domain/ranking/ranking-repository.port';

export interface PlayerRank {
  position: number;
  total: number;
}

export async function playerRankOf(
  rankings: RankingRepository,
  userId: string,
): Promise<PlayerRank | null> {
  const [standing, total] = await Promise.all([
    rankings.standingOf(PROFILE_RANKING_CATEGORY, userId),
    rankings.rankedCount(PROFILE_RANKING_CATEGORY),
  ]);

  return standing ? { position: standing.position, total } : null;
}
