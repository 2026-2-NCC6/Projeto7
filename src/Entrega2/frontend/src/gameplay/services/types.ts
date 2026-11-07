import type { DeviceKind } from '../../device/contracts';
import type { GameModeId, ProgressionTrack } from '../../types/game';
import type { SessionInterruptions } from '../domain/metrics/session-result';
import type { TrainingRef } from '../training/training-run';

export type EndReason = 'cleared' | 'timeExpired' | 'mistakesExhausted' | 'deviceLost' | 'emergencyStop';

export interface AttemptRequest {
  atMs: number;
  responseMs: number;
  verdict: 'correct' | 'incorrect';
  targetId: number | null;
  scoreDelta: number;
  intensity: number | null;
}

export interface TargetPerformanceRequest {
  targetId: number;
  attempts: number;
  correctHits: number;
  impactAverage: number | null;
  impactPeak: number | null;
}

export interface StartSessionRequest {
  mode: GameModeId;
  level: number;
  training?: TrainingRef;
}

export interface StartedSession {
  ticket: string;
  startedAt: string;
}

export interface SessionResultRequest {
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
  training?: TrainingRef;
  endReason?: EndReason;
  stopReason?: string;
  interruptions: SessionInterruptions;
  deviceId?: string;
  attempts: AttemptRequest[];
}

export interface RecordSessionRequest extends SessionResultRequest {
  ticket: string;
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
