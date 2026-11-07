import { endpoints } from '../api/endpoints';
import { get, patch } from '../api/httpClient';
import type { PractitionerProfile, Profile } from './types';

export const profileService = {
  profile(accessToken: string): Promise<Profile> {
    return get<Profile>(endpoints.profile, accessToken);
  },

  updatePractitioner(
    name: string,
    practitioner: PractitionerProfile,
    accessToken: string,
  ): Promise<{ name: string; practitioner: PractitionerProfile }> {
    return patch(endpoints.profile, { name, ...practitioner }, accessToken);
  },
};
