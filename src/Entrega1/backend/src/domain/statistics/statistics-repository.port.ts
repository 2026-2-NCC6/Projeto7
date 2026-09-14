import { StatisticsScope } from './statistics-scope';
import {
  ActivitySummary,
  DailyActivity,
  ModeBreakdown,
  RecentSession,
  TargetBreakdown,
} from './training-statistics';

export interface StatisticsRepository {
  summaryFor(scope: StatisticsScope): Promise<ActivitySummary>;
  modesFor(scope: StatisticsScope): Promise<ModeBreakdown[]>;
  dailyActivityFor(scope: StatisticsScope, since: Date): Promise<DailyActivity[]>;
  targetsFor(scope: StatisticsScope): Promise<TargetBreakdown[]>;
  recentSessionsFor(scope: StatisticsScope, limit: number): Promise<RecentSession[]>;
}

export const STATISTICS_REPOSITORY = Symbol('StatisticsRepository');
