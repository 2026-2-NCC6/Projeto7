import { GameMode } from '../game/game-mode';
import { DeviceKind } from './device-kind';
import { EndReason, SessionAttempt, SessionInterruptions, TrainingRef } from './session-context';
import { TargetPerformance } from './target-performance';

export interface SessionHistoryFilter {
  userId?: string;
  trainingId?: string;
  authorId?: string;
  from?: Date;
  to?: Date;
  limit: number;
  offset: number;
}

export interface SessionSummary {
  id: string;
  userId: string;
  playerName: string;
  mode: GameMode;
  level: number;
  cleared: boolean;
  score: number;
  hits: number;
  misses: number;
  accuracyPercent: number | null;
  durationMs: number;
  xpAwarded: number;
  deviceKind: DeviceKind;
  deviceId: string | null;
  training: (TrainingRef & { title: string | null }) | null;
  endReason: EndReason | null;
  offline: boolean;
  playedAt: Date;
}

export interface SessionPage {
  items: SessionSummary[];
  total: number;
}

export interface SessionDetail extends SessionSummary {
  bestStreak: number;
  avgResponseMs: number | null;
  bestResponseMs: number | null;
  stopReason: string | null;
  interruptions: SessionInterruptions;
  targets: TargetPerformance[];
  attempts: SessionAttempt[];
  trainingAuthorId: string | null;
}

export interface DeviceUsage {
  deviceId: string;
  deviceKind: DeviceKind;
  sessions: number;
  players: number;
  emergencyStops: number;
  deviceLosses: number;
  faults: number;
  lastSeenAt: Date;
}

export interface OperationCounts {
  emergencyStops: number;
  offlineSessions: number;
  trainingSessions: number;
}

export interface SessionHistoryRepository {
  list(filter: SessionHistoryFilter): Promise<SessionPage>;
  detail(id: string): Promise<SessionDetail | null>;
  devices(): Promise<DeviceUsage[]>;
  operationCounts(): Promise<OperationCounts>;
}

export const SESSION_HISTORY_REPOSITORY = Symbol('SessionHistoryRepository');
