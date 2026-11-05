import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api, configureClient } from '../api/client';
import type { AuthResponse, AuthUser, UserRole } from '../api/types';

const STORAGE_KEY = 'smash.session';

interface StoredSession {
  user: AuthUser;
  accessToken: string;
}

interface AuthState {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (name: string, email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  rename: (name: string) => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

function readStored(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeStored(session: StoredSession | null): void {
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    return;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readStored());

  const clear = useCallback(() => {
    writeStored(null);
    configureClient(null, () => undefined);
    setSession(null);
  }, []);

  configureClient(session?.accessToken ?? null, clear);

  const start = useCallback((response: AuthResponse) => {
    const next = { user: response.user, accessToken: response.accessToken };
    writeStored(next);
    configureClient(next.accessToken, clear);
    setSession(next);
    return response.user;
  }, [clear]);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      signIn: async (email, password) => start(await api.signIn(email, password)),
      signUp: async (name, email, password) => start(await api.signUp(name, email, password)),
      signOut: async () => {
        await api.signOut().catch(() => undefined);
        clear();
      },
      rename: (name) => {
        if (session) {
          const next = { ...session, user: { ...session.user, name } };
          writeStored(next);
          setSession(next);
        }
      },
      hasRole: (...roles) => Boolean(session && roles.includes(session.user.role)),
    }),
    [session, start, clear],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa do AuthProvider.');
  }

  return context;
}
