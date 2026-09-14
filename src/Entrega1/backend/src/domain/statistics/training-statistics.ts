import { GameMode } from '../game/game-mode';
import { DeviceKind } from '../training-session/device-kind';

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
  firstPlayedAt: Date | null;
  lastPlayedAt: Date | null;
}

export interface ModeBreakdown {
  mode: GameMode;
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
  mode: GameMode;
  level: number;
  cleared: boolean;
  score: number;
  accuracyPercent: number | null;
  durationMs: number;
  deviceKind: DeviceKind;
  playedAt: Date;
}
