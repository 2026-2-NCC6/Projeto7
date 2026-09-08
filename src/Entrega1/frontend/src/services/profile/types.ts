import type { SessionStats, TrackProgress } from '../home/types';
import type { GameModeId } from '../../types/game';

export type AchievementId =
  | 'first_session'
  | 'sessions_25'
  | 'sessions_100'
  | 'level_10'
  | 'level_25'
  | 'level_50'
  | 'level_color_20'
  | 'level_score_20'
  | 'xp_10k'
  | 'xp_50k'
  | 'streak_7'
  | 'streak_30'
  | 'streak_100'
  | 'score_10k'
  | 'score_100k'
  | 'accuracy_80'
  | 'accuracy_90'
  | 'accuracy_95'
  | 'hit_streak_25'
  | 'hit_streak_50'
  | 'hit_streak_100'
  | 'mode_level_color_10'
  | 'mode_level_score_10'
  | 'mode_infinite_color_10'
  | 'mode_infinite_score_10'
  | 'rank_top_100'
  | 'rank_top_10'
  | 'rank_first';

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

export interface Achievement {
  id: AchievementId;
  category: AchievementCategory;
  tier: AchievementTier;
  target: number;
  current: number | null;
  progress: number | null;
  unlocked: boolean;
}

export interface ProfilePlayer {
  id: string;
  name: string;
  email: string;
  level: number;
}

export interface ProfileStats extends SessionStats {
  accuracyPercent: number | null;
}

export interface ProfileRecords {
  bestScore: number | null;
  fastestLevelMs: number | null;
  longestHitStreak: number | null;
}

export interface PlayerRank {
  position: number;
  total: number;
}

export interface Profile {
  player: ProfilePlayer;
  progress: TrackProgress[];
  stats: ProfileStats;
  records: ProfileRecords;
  favoriteMode: GameModeId | null;
  rank: PlayerRank | null;
  achievements: Achievement[];
}
