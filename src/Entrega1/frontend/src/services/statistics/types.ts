import type { DeviceKind } from '../../device/contracts';
import type { GameModeId } from '../../types/game';
import type { TrackProgress } from '../home/types';
import type { PlayerRank } from '../profile/types';

export interface ActivitySummary {
  sessions: number;
  playTimeMs: number;
  hits: number;
  misses: number;
  accuracyPercent: number | null;
  averageResponseMs: number | null;
  bestResponseMs: number | null;
  xpEarned: number;
  totalScore: number;
  bestScore: number | null;
  longestHitStreak: number;
  hardwareSessions: number;
  firstPlayedAt: string | null;
  lastPlayedAt: string | null;
}

export interface ModeBreakdown {
  mode: GameModeId;
  sessions: number;
  playTimeMs: number;
  accuracyPercent: number | null;
  bestScore: number | null;
  highestCleared: number;
}

export interface DailyActivity {
  day: string;
  sessions: number;
  score: number;
  accuracyPercent: number | null;
}

export interface TargetBreakdown {
  targetId: number;
  attempts: number;
  correctHits: number;
  accuracyPercent: number | null;
  impactAverage: number | null;
  impactPeak: number | null;
}

export interface RecentSession {
  id: string;
  mode: GameModeId;
  level: number;
  cleared: boolean;
  score: number;
  accuracyPercent: number | null;
  durationMs: number;
  deviceKind: DeviceKind;
  playedAt: string;
}

export interface PlayerStatistics {
  player: {
    name: string;
    level: number;
    memberSince: string;
  };
  summary: ActivitySummary;
  modes: ModeBreakdown[];
  activity: DailyActivity[];
  targets: TargetBreakdown[];
  recentSessions: RecentSession[];
  progress: TrackProgress[];
  streak: {
    current: number;
    longest: number;
  };
  rank: PlayerRank | null;
}
