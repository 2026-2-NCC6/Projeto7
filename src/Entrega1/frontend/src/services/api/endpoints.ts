import type { RankingCategory } from '../ranking/types';

export const endpoints = {
  signUp: '/auth/sign-up',
  signIn: '/auth/sign-in',
  signOut: '/auth/sign-out',
  home: '/me/home',
  profile: '/me/profile',
  startSession: '/me/sessions/start',
  recordSession: '/me/sessions',
  recordOfflineSession: '/me/sessions/offline',
  trainings: '/trainings',
  training: (id: string) => `/trainings/${id}`,
  statistics: '/me/statistics',
  ranking: (category: RankingCategory) => `/rankings/${category}`,
} as const;
