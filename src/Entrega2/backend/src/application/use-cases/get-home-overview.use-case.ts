import { DailyStreak } from '../../domain/daily-streak/daily-streak.entity';
import { DailyStreakRepository } from '../../domain/daily-streak/daily-streak-repository.port';
import { GameMode } from '../../domain/game/game-mode';
import { ProgressionRepository } from '../../domain/progression/progression-repository.port';
import { EMPTY_SESSION_INSIGHTS } from '../../domain/training-session/session-insights';
import { EMPTY_SESSION_STATS, SessionStats } from '../../domain/training-session/session-stats';
import { TrainingSessionRepository } from '../../domain/training-session/training-session-repository.port';
import { UserNotFoundError } from '../../domain/user/errors';
import { UserRepository } from '../../domain/user/user-repository.port';
import { toTrackProgressView, TrackProgressView } from './track-progress';

export interface HomeOverview {
  player: {
    name: string;
  };
  dailyChallenge: {
    currentStreak: number;
    longestStreak: number;
    completedToday: boolean;
  };
  progress: TrackProgressView[];
  stats: SessionStats;
  highestClearedByMode: Record<GameMode, number>;
}

export class GetHomeOverviewUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly progressions: ProgressionRepository,
    private readonly dailyStreaks: DailyStreakRepository,
    private readonly sessions: TrainingSessionRepository,
  ) {}

  async execute(userId: string): Promise<HomeOverview> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const [progressions, dailyStreak, stats, insights] = await Promise.all([
      this.progressions.findByUser(userId),
      this.dailyStreaks.findByUser(userId),
      this.sessions.statsFor(userId),
      this.sessions.insightsFor(userId),
    ]);

    const streak = dailyStreak ?? DailyStreak.start(userId);

    return {
      player: { name: user.name },
      dailyChallenge: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        completedToday: streak.isCompletedOn(new Date()),
      },
      progress: progressions.map(toTrackProgressView),
      stats: stats ?? EMPTY_SESSION_STATS,
      highestClearedByMode: (insights ?? EMPTY_SESSION_INSIGHTS).highestClearedByMode,
    };
  }
}
