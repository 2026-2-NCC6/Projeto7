import { DailyStreak } from '../daily-streak/daily-streak.entity';
import { Progression } from '../progression/progression.entity';
import { TrainingSession } from './training-session.entity';

/**
 * Everything a finished training changes, committed together. Mirrors the
 * `Account` aggregate used when a player signs up.
 */
export interface CompletedTraining {
  session: TrainingSession;
  progression: Progression;
  dailyStreak: DailyStreak;
}
