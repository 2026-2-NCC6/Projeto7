import { Audience, Difficulty, Objective, TargetColor, TrainingContent } from './training-content';
import { Training, TrainingStatus, TrainingVersion } from './training.entity';

export interface CatalogFilter {
  audience?: Audience;
  objective?: Objective;
  difficulty?: Difficulty;
  maxMinutes?: number;
  color?: TargetColor;
  search?: string;
}

export interface CatalogEntry {
  id: string;
  version: number;
  content: TrainingContent;
  authorName: string;
  publishedAt: Date;
  sessions: number;
}

export interface StudioEntry {
  training: Training;
  authorName: string;
  sessions: number;
}

export interface StudioFilter {
  authorId?: string;
  status?: TrainingStatus;
}

export interface VersionEntry {
  version: number;
  publishedAt: Date;
  publishedByName: string;
  changeNote: string;
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

export interface TrainingRepository {
  findById(id: string): Promise<Training | null>;
  save(training: Training): Promise<void>;
  publish(training: Training, version: TrainingVersion): Promise<void>;
  studio(filter: StudioFilter): Promise<StudioEntry[]>;
  studioEntry(id: string): Promise<StudioEntry | null>;
  catalog(filter: CatalogFilter): Promise<CatalogEntry[]>;
  publishedVersion(id: string, version?: number): Promise<CatalogEntry | null>;
  versionsOf(id: string): Promise<VersionEntry[]>;
  stepBreakdownOf(id: string): Promise<StepBreakdown[]>;
  countByStatus(): Promise<Record<TrainingStatus, number>>;
}

export const TRAINING_REPOSITORY = Symbol('TrainingRepository');
