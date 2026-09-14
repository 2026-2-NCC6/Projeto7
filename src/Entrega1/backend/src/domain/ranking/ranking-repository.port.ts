import { LeaderboardEntry, Standings } from './leaderboard';
import { RankingCategory } from './ranking-category';

export interface RankingRepository {
  standings(category: RankingCategory, limit: number): Promise<Standings>;
  standingOf(category: RankingCategory, userId: string): Promise<LeaderboardEntry | null>;
  rankedCount(category: RankingCategory): Promise<number>;
}

export const RANKING_REPOSITORY = Symbol('RankingRepository');
