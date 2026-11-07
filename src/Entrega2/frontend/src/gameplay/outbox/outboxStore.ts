import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SessionResultRequest } from '../services/types';

export interface PendingSession {
  readonly clientSessionId: string;
  readonly ticket: string | null;
  readonly playedAt: string;
  readonly request: SessionResultRequest;
}

interface OutboxState {
  pending: PendingSession[];
  enqueue: (session: PendingSession) => void;
  remove: (clientSessionId: string) => void;
}

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      pending: [],
      enqueue: (session) => set((state) => ({ pending: [...state.pending, session] })),
      remove: (clientSessionId) =>
        set((state) => ({
          pending: state.pending.filter((session) => session.clientSessionId !== clientSessionId),
        })),
    }),
    {
      name: 'smash.outbox',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ pending }) => ({ pending }),
    },
  ),
);
