import { endpoints } from '../api/endpoints';
import { get } from '../api/httpClient';
import type { Profile } from './types';

export const profileService = {
  profile(accessToken: string): Promise<Profile> {
    return get<Profile>(endpoints.profile, accessToken);
  },
};
