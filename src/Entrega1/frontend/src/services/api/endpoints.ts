import type { RankingCategory } from '../ranking/types';

export const endpoints = {
  signUp: '/auth/sign-up',
  signIn: '/auth/sign-in',
  home: '/me/home',
  profile: '/me/profile',
  recordSession: '/me/sessions',
  ranking: (category: RankingCategory) => `/rankings/${category}`,
} as const;
