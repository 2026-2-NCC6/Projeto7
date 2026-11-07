import { endpoints } from '../api/endpoints';
import { get } from '../api/httpClient';
import type { Leaderboard, RankingCategory } from './types';

export const rankingService = {
  leaderboard(category: RankingCategory, accessToken: string | null): Promise<Leaderboard> {
    return get<Leaderboard>(endpoints.ranking(category), accessToken);
  },
};
