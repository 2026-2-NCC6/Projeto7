import type { TrainingStep } from '@app/gameplay/training/training-step';
import type { TargetColor } from '@app/types/game';

export type { TrainingStep };
export type { TargetColor };

export type UserRole = 'player' | 'coach' | 'admin';
export type GameMode = 'level_color' | 'level_score' | 'infinite_color' | 'infinite_score';
export type Audience = 'kids' | 'teens' | 'adults' | 'seniors' | 'all';
export type Objective = 'precision' | 'consistency' | 'reaction' | 'endurance' | 'fun';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Category = 'warmup' | 'precision' | 'reaction' | 'endurance' | 'kids' | 'competition';
export type License = 'free' | 'cc_by' | 'proprietary';
export type PricingModel = 'free' | 'one_time' | 'subscription';
export type TrainingStatus = 'draft' | 'in_review' | 'published' | 'archived';
export type EndReason = 'cleared' | 'timeExpired' | 'mistakesExhausted' | 'deviceLost' | 'emergencyStop';
export type AgeGroup = 'child' | 'teen' | 'adult' | 'senior';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type PracticeGoal = 'precision' | 'consistency' | 'reaction' | 'fitness' | 'fun';
export type DominantHand = 'right' | 'left';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface MarketplaceMetadata {
  category: Category;
  commercialDescription: string;
  license: License;
  pricingModel: PricingModel;
  priceCents: number | null;
  compatibility: string[];
}

export interface TrainingContent {
  title: string;
  summary: string;
  audience: Audience;
  objective: Objective;
  difficulty: Difficulty;
  estimatedMinutes: number;
  instructions: string;
  scoringRules: string;
  equipment: string[];
  risks: string[];
  steps: TrainingStep[];
  marketplace: MarketplaceMetadata;
}

export interface CatalogTraining {
  id: string;
  version: number;
  title: string;
  summary: string;
  audience: Audience;
  objective: Objective;
  difficulty: Difficulty;
  estimatedMinutes: number;
  stepCount: number;
  targetColors: TargetColor[];
  category: Category;
  pricingModel: PricingModel;
  priceCents: number | null;
  authorName: string;
  publishedAt: string;
  sessions: number;
}

export interface CatalogTrainingDetail extends CatalogTraining {
  content: TrainingContent;
}

export interface TrainingVersion {
  version: number;
  publishedAt: string;
  publishedByName: string;
  changeNote: string;
}

export interface StudioTraining {
  id: string;
  status: TrainingStatus;
  revision: number;
  simulated: boolean;
  hasUnpublishedChanges: boolean;
  listed: boolean;
  currentVersion: number;
  reviewNote: string | null;
  authorId: string;
  authorName: string;
  sessions: number;
  targetColors: TargetColor[];
  draft: TrainingContent;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StudioTrainingDetail extends StudioTraining {
  versions: TrainingVersion[];
}

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

export interface ModeBreakdown {
  mode: GameMode;
  sessions: number;
  playTimeMs: number;
  accuracyPercent: number | null;
  bestScore: number | null;
  highestCleared: number;
}

export interface StepBreakdown {
  version: number;
  stepIndex: number;
  sessions: number;
  clearedSessions: number;
  hits: number;
  misses: number;
  averageScore: number | null;
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
  deviceKind: 'simulated' | 'websocket';
  deviceId: string | null;
  training: { id: string; version: number; stepIndex: number; title: string | null } | null;
  endReason: EndReason | null;
  offline: boolean;
  playedAt: string;
}

export interface SessionAttempt {
  atMs: number;
  responseMs: number;
  verdict: 'correct' | 'incorrect';
  targetId: number | null;
  scoreDelta: number;
  intensity: number | null;
}

export interface SessionDetail extends SessionSummary {
  bestStreak: number;
  avgResponseMs: number | null;
  bestResponseMs: number | null;
  stopReason: string | null;
  interruptions: { pauses: number; deviceLosses: number; faults: number };
  targets: {
    targetId: number;
    attempts: number;
    correctHits: number;
    impactAverage: number | null;
    impactPeak: number | null;
  }[];
  attempts: SessionAttempt[];
}

export interface Page<T> {
  items: T[];
  total: number;
}

export interface TrainingAnalytics {
  summary: ActivitySummary;
  activity: DailyActivity[];
  targets: TargetBreakdown[];
  steps: StepBreakdown[];
  recentSessions: SessionSummary[];
}

export interface AdminOverview {
  summary: ActivitySummary;
  activity: DailyActivity[];
  modes: ModeBreakdown[];
  targets: TargetBreakdown[];
  usersByRole: Record<UserRole, number>;
  trainingsByStatus: Record<TrainingStatus, number>;
  operations: { emergencyStops: number; offlineSessions: number; trainingSessions: number };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ageGroup: AgeGroup | null;
  sessions: number;
  lastPlayedAt: string | null;
  createdAt: string;
}

export interface DeviceUsage {
  deviceId: string;
  deviceKind: 'simulated' | 'websocket';
  sessions: number;
  players: number;
  emergencyStops: number;
  deviceLosses: number;
  faults: number;
  lastSeenAt: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  outcome: 'success' | 'failure';
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown>;
  ip: string | null;
}

export interface PractitionerProfile {
  ageGroup: AgeGroup | null;
  skillLevel: SkillLevel | null;
  goals: PracticeGoal[];
  dominantHand: DominantHand | null;
  restrictions: string | null;
}

export interface ProfileView {
  player: {
    id: string;
    name: string;
    email: string;
    level: number;
    role: UserRole;
    practitioner: PractitionerProfile;
  };
}

export interface PlayerStatistics {
  summary: ActivitySummary;
  activity: DailyActivity[];
  targets: TargetBreakdown[];
}
