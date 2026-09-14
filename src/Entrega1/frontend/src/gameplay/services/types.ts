import type { DeviceKind } from '../../device/contracts';
import type { GameModeId, ProgressionTrack } from '../../types/game';

export interface TargetPerformanceRequest {
  targetId: number;
  attempts: number;
  correctHits: number;
  impactAverage: number | null;
  impactPeak: number | null;
}

export interface RecordSessionRequest {
  mode: GameModeId;
  level: number;
  cleared: boolean;
  score: number;
  hits: number;
  misses: number;
  bestStreak: number;
  durationMs: number;
  avgResponseMs?: number;
  bestResponseMs?: number;
  deviceKind: DeviceKind;
  targets: TargetPerformanceRequest[];
}

export interface RecordedSession {
  xpAwarded: number;
  progression: {
    track: ProgressionTrack;
    level: number;
    xp: number;
    xpRequired: number;
  };
  leveledUp: boolean;
  dailyStreak: {
    currentStreak: number;
    longestStreak: number;
    completedToday: boolean;
  };
}
