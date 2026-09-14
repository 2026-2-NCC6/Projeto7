import { AchievementStatus } from '../../domain/achievement/achievement';
import { evaluateAchievements } from '../../domain/achievement/achievement-rules';
import { DailyStreak } from '../../domain/daily-streak/daily-streak.entity';
import { DailyStreakRepository } from '../../domain/daily-streak/daily-streak-repository.port';
import { GameMode } from '../../domain/game/game-mode';
import { ProgressionRepository } from '../../domain/progression/progression-repository.port';
import { highestLevelOf } from '../../domain/progression/progression.entity';
import { RankingRepository } from '../../domain/ranking/ranking-repository.port';
import {
  EMPTY_SESSION_INSIGHTS,
  favoriteModeOf,
  SessionRecords,
} from '../../domain/training-session/session-insights';
import { EMPTY_SESSION_STATS, SessionStats } from '../../domain/training-session/session-stats';
import { TrainingSessionRepository } from '../../domain/training-session/training-session-repository.port';
import { UserNotFoundError } from '../../domain/user/errors';
import { UserRepository } from '../../domain/user/user-repository.port';
import { playerRankOf, PlayerRank } from './player-rank';
import { toTrackProgressView, TrackProgressView } from './track-progress';

export interface ProfileView {
  player: {
    id: string;
    name: string;
    email: string;
    level: number;
  };
  progress: TrackProgressView[];
  stats: SessionStats & { accuracyPercent: number | null };
  records: SessionRecords;
  favoriteMode: GameMode | null;
  rank: PlayerRank | null;
  achievements: AchievementStatus[];
}

export class GetProfileUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly progressions: ProgressionRepository,
    private readonly dailyStreaks: DailyStreakRepository,
    private readonly sessions: TrainingSessionRepository,
    private readonly rankings: RankingRepository,
  ) {}

  async execute(userId: string): Promise<ProfileView> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const [progressions, dailyStreak, stats, insights, rank] = await Promise.all([
      this.progressions.findByUser(userId),
      this.dailyStreaks.findByUser(userId),
      this.sessions.statsFor(userId),
      this.sessions.insightsFor(userId),
      playerRankOf(this.rankings, userId),
    ]);

    const streak = dailyStreak ?? DailyStreak.start(userId);
    const sessionStats = stats ?? EMPTY_SESSION_STATS;
    const sessionInsights = insights ?? EMPTY_SESSION_INSIGHTS;

    return {
      player: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: highestLevelOf(progressions),
      },
      progress: progressions.map(toTrackProgressView),
      stats: { ...sessionStats, accuracyPercent: sessionInsights.accuracyPercent },
      records: sessionInsights.records,
      favoriteMode: favoriteModeOf(sessionInsights.sessionsByMode),
      rank,
      achievements: evaluateAchievements({
        progressions,
        dailyStreak: streak,
        sessionStats,
        sessionInsights,
        leaderboardPosition: rank?.position ?? null,
      }),
    };
  }
}
