import { endpoints } from '../api/endpoints';
import { get } from '../api/httpClient';
import type { HomeOverview } from './types';

export const homeService = {
  overview(accessToken: string): Promise<HomeOverview> {
    return get<HomeOverview>(endpoints.home, accessToken);
  },
};
