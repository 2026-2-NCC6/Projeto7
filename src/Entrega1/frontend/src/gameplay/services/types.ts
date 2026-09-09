import type { GameModeId, ProgressionTrack } from '../../types/game';

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
