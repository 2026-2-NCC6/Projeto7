import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SafetyState {
  stopping: boolean;
  locked: boolean;
  reason: string | null;
  lockedAt: number | null;
  beginStop: () => void;
  cancelStop: () => void;
  lock: (reason: string) => void;
  unlock: () => void;
}

export const useSafetyStore = create<SafetyState>()(
  persist(
    (set) => ({
      stopping: false,
      locked: false,
      reason: null,
      lockedAt: null,
      beginStop: () => set({ stopping: true }),
      cancelStop: () => set({ stopping: false }),
      lock: (reason) => set({ stopping: false, locked: true, reason, lockedAt: Date.now() }),
      unlock: () => set({ locked: false, reason: null, lockedAt: null }),
    }),
    {
      name: 'smash.safety',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ locked, reason, lockedAt }) => ({ locked, reason, lockedAt }),
    },
  ),
);
