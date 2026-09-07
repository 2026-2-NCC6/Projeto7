import { create } from 'zustand';
import { authService } from '../services/auth/authService';
import type { SignInRequest, SignUpRequest } from '../services/auth/types';
import type { User } from '../types/user';

export type SessionKind = 'none' | 'authenticated' | 'guest';

interface AuthState {
  session: SessionKind;
  user: User | null;
  accessToken: string | null;
  signUp: (request: SignUpRequest) => Promise<void>;
  signIn: (request: SignInRequest) => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: 'none',
  user: null,
  accessToken: null,

  async signUp(request) {
    const { user, accessToken } = await authService.signUp(request);
    set({ session: 'authenticated', user, accessToken });
  },

  async signIn(request) {
    const { user, accessToken } = await authService.signIn(request);
    set({ session: 'authenticated', user, accessToken });
  },

  continueAsGuest() {
    set({ session: 'guest', user: null, accessToken: null });
  },

  signOut() {
    set({ session: 'none', user: null, accessToken: null });
  },
}));
