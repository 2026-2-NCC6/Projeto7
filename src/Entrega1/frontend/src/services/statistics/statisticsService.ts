import { endpoints } from '../api/endpoints';
import { get } from '../api/httpClient';
import type { PlayerStatistics } from './types';

export const statisticsService = {
  statistics(accessToken: string): Promise<PlayerStatistics> {
    return get<PlayerStatistics>(endpoints.statistics, accessToken);
  },
};
