import { DailyStreak } from './daily-streak.entity';

export interface DailyStreakRepository {
  findByUser(userId: string): Promise<DailyStreak | null>;
}

export const DAILY_STREAK_REPOSITORY = Symbol('DailyStreakRepository');
