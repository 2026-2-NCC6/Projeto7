import { AchievementCriterion } from './achievement-criteria';

export type AchievementCategory =
  | 'level'
  | 'xp'
  | 'dailyStreak'
  | 'sessions'
  | 'score'
  | 'accuracy'
  | 'hitStreak'
  | 'mode'
  | 'rank';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'legend';

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  criterion: AchievementCriterion;
}

export interface AchievementStatus {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  target: number;
  current: number | null;
  progress: number | null;
  unlocked: boolean;
}
