import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemePreference } from '../theme';

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  markHydrated: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      hydrated: false,

      setPreference(preference) {
        set({ preference });
      },

      markHydrated() {
        set({ hydrated: true });
      },
    }),
    {
      name: 'smash:theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ preference }) => ({ preference }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
