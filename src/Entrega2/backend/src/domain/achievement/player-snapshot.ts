import { DailyStreak } from '../daily-streak/daily-streak.entity';
import { Progression } from '../progression/progression.entity';
import { SessionInsights } from '../training-session/session-insights';
import { SessionStats } from '../training-session/session-stats';

export interface PlayerSnapshot {
  progressions: Progression[];
  dailyStreak: DailyStreak;
  sessionStats: SessionStats;
  sessionInsights: SessionInsights;
  leaderboardPosition: number | null;
}
