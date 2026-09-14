import { DailyStreak } from '../../domain/daily-streak/daily-streak.entity';
import { DailyStreakRepository } from '../../domain/daily-streak/daily-streak-repository.port';
import { ProgressionRepository } from '../../domain/progression/progression-repository.port';
import { highestLevelOf } from '../../domain/progression/progression.entity';
import { RankingRepository } from '../../domain/ranking/ranking-repository.port';
import {
  activityWindowStart,
  completeModeBreakdown,
  completeTargetBreakdown,
  fillActivityWindow,
} from '../../domain/statistics/statistics-rules';
import { StatisticsRepository } from '../../domain/statistics/statistics-repository.port';
import { playerScope } from '../../domain/statistics/statistics-scope';
import {
  ActivitySummary,
  DailyActivity,
  ModeBreakdown,
  RecentSession,
  TargetBreakdown,
} from '../../domain/statistics/training-statistics';
import { UserNotFoundError } from '../../domain/user/errors';
import { UserRepository } from '../../domain/user/user-repository.port';
import { playerRankOf, PlayerRank } from './player-rank';
import { toTrackProgressView, TrackProgressView } from './track-progress';

export const ACTIVITY_WINDOW_DAYS = 30;
export const RECENT_SESSIONS_LIMIT = 10;

export interface PlayerStatisticsView {
  player: {
    name: string;
    level: number;
    memberSince: Date;
  };
  summary: ActivitySummary;
  modes: ModeBreakdown[];
  activity: DailyActivity[];
  targets: TargetBreakdown[];
  recentSessions: RecentSession[];
  progress: TrackProgressView[];
  streak: {
    current: number;
    longest: number;
  };
  rank: PlayerRank | null;
}

export class GetPlayerStatisticsUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly progressions: ProgressionRepository,
    private readonly dailyStreaks: DailyStreakRepository,
    private readonly statistics: StatisticsRepository,
    private readonly rankings: RankingRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute(userId: string): Promise<PlayerStatisticsView> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const scope = playerScope(userId);
    const today = this.clock();

    const [progressions, dailyStreak, summary, modes, activity, targets, recentSessions, rank] =
      await Promise.all([
        this.progressions.findByUser(userId),
        this.dailyStreaks.findByUser(userId),
        this.statistics.summaryFor(scope),
        this.statistics.modesFor(scope),
        this.statistics.dailyActivityFor(scope, activityWindowStart(today, ACTIVITY_WINDOW_DAYS)),
        this.statistics.targetsFor(scope),
        this.statistics.recentSessionsFor(scope, RECENT_SESSIONS_LIMIT),
        playerRankOf(this.rankings, userId),
      ]);

    const streak = dailyStreak ?? DailyStreak.start(userId);

    return {
      player: {
        name: user.name,
        level: highestLevelOf(progressions),
        memberSince: user.createdAt,
      },
      summary,
      modes: completeModeBreakdown(modes),
      activity: fillActivityWindow(activity, today, ACTIVITY_WINDOW_DAYS),
      targets: completeTargetBreakdown(targets),
      recentSessions,
      progress: progressions.map(toTrackProgressView),
      streak: { current: streak.currentStreak, longest: streak.longestStreak },
      rank,
    };
  }
}
