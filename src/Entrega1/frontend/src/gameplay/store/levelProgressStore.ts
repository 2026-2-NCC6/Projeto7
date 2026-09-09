import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PlayableModeId } from '../../types/game';
import { PLAYABLE_MODES } from '../../types/game';
import type { SessionResult } from '../domain/metrics/session-result';

export interface ModeProgress {
  highestCleared: number;
  bestScoreByLevel: Record<number, number>;
}

interface LevelProgressState {
  byMode: Record<PlayableModeId, ModeProgress>;
  introSeen: Record<PlayableModeId, boolean>;
  hydrated: boolean;
  /** Bumped once a finished session is safely stored, so screens can refetch. */
  lastSyncedAt: number;
  recordResult: (result: SessionResult) => void;
  markSynced: () => void;
  syncHighestCleared: (highestByMode: Partial<Record<PlayableModeId, number>>) => void;
  markIntroSeen: (mode: PlayableModeId) => void;
  markHydrated: () => void;
}

function emptyProgress(): Record<PlayableModeId, ModeProgress> {
  return PLAYABLE_MODES.reduce(
    (progress, mode) => ({ ...progress, [mode]: { highestCleared: 0, bestScoreByLevel: {} } }),
    {} as Record<PlayableModeId, ModeProgress>,
  );
}

function emptyIntroSeen(): Record<PlayableModeId, boolean> {
  return PLAYABLE_MODES.reduce(
    (seen, mode) => ({ ...seen, [mode]: false }),
    {} as Record<PlayableModeId, boolean>,
  );
}

export const useLevelProgressStore = create<LevelProgressState>()(
  persist(
    (set) => ({
      byMode: emptyProgress(),
      introSeen: emptyIntroSeen(),
      hydrated: false,
      lastSyncedAt: 0,

      recordResult({ mode, level, cleared, metrics }) {
        set((state) => {
          const current = state.byMode[mode];
          const best = current.bestScoreByLevel[level] ?? 0;

          return {
            byMode: {
              ...state.byMode,
              [mode]: {
                highestCleared: cleared
                  ? Math.max(current.highestCleared, level)
                  : current.highestCleared,
                bestScoreByLevel: {
                  ...current.bestScoreByLevel,
                  [level]: Math.max(best, metrics.finalScore),
                },
              },
            },
          };
        });
      },

      // The server owns how far a signed-in player got, so this replaces the
      // local value instead of merging — otherwise progress from another
      // account on the same device would leak in.
      syncHighestCleared(highestByMode) {
        set((state) => ({
          byMode: PLAYABLE_MODES.reduce(
            (progress, mode) => ({
              ...progress,
              [mode]: {
                ...state.byMode[mode],
                highestCleared: highestByMode[mode] ?? 0,
              },
            }),
            {} as Record<PlayableModeId, ModeProgress>,
          ),
        }));
      },

      markSynced() {
        set({ lastSyncedAt: Date.now() });
      },

      markIntroSeen(mode) {
        set((state) => ({ introSeen: { ...state.introSeen, [mode]: true } }));
      },

      markHydrated() {
        set({ hydrated: true });
      },
    }),
    {
      name: 'smash:levels',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ byMode, introSeen }) => ({ byMode, introSeen }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);

export function isLevelUnlocked(progress: ModeProgress, level: number): boolean {
  return level <= progress.highestCleared + 1;
}
