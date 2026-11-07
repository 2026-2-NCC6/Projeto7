import { useCallback, useEffect, useState } from 'react';
import { profileService } from '../services/profile/profileService';
import type { Profile } from '../services/profile/types';
import { useLevelProgressStore } from '../gameplay/store/levelProgressStore';
import { useAuthStore } from '../store/authStore';
import { toFormErrorMessage } from './formError';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useProfile(): ProfileState {
  const accessToken = useAuthStore((state) => state.accessToken);
  const lastSyncedAt = useLevelProgressStore((state) => state.lastSyncedAt);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(accessToken));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setProfile(await profileService.profile(accessToken));
    } catch (cause) {
      setError(toFormErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, lastSyncedAt]);

  return { profile, loading, error, reload: () => void load() };
}
