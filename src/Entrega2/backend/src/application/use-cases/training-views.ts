import {
  CatalogEntry,
  StudioEntry,
  VersionEntry,
} from '../../domain/training/training-repository.port';
import {
  Audience,
  Category,
  Difficulty,
  Objective,
  PricingModel,
  TargetColor,
  TrainingContent,
  targetColorsOf,
} from '../../domain/training/training-content';
import { Training, TrainingStatus } from '../../domain/training/training.entity';

export interface StudioTrainingView {
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
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface CatalogTrainingView {
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
  publishedAt: Date;
  sessions: number;
}

export interface CatalogTrainingDetail extends CatalogTrainingView {
  content: TrainingContent;
}

export type VersionView = VersionEntry;

export function toStudioView(training: Training, authorName: string, sessions: number): StudioTrainingView {
  return {
    id: training.id,
    status: training.status,
    revision: training.revision,
    simulated: training.isSimulated,
    hasUnpublishedChanges: training.hasUnpublishedChanges,
    listed: training.isListed,
    currentVersion: training.currentVersion,
    reviewNote: training.reviewNote,
    authorId: training.authorId,
    authorName,
    sessions,
    targetColors: targetColorsOf(training.draft),
    draft: training.draft,
    createdAt: training.createdAt,
    updatedAt: training.updatedAt,
    publishedAt: training.publishedAt,
  };
}

export function toStudioEntryView({ training, authorName, sessions }: StudioEntry): StudioTrainingView {
  return toStudioView(training, authorName, sessions);
}

export function toCatalogView(entry: CatalogEntry): CatalogTrainingView {
  const { content } = entry;

  return {
    id: entry.id,
    version: entry.version,
    title: content.title,
    summary: content.summary,
    audience: content.audience,
    objective: content.objective,
    difficulty: content.difficulty,
    estimatedMinutes: content.estimatedMinutes,
    stepCount: content.steps.length,
    targetColors: targetColorsOf(content),
    category: content.marketplace.category,
    pricingModel: content.marketplace.pricingModel,
    priceCents: content.marketplace.priceCents,
    authorName: entry.authorName,
    publishedAt: entry.publishedAt,
    sessions: entry.sessions,
  };
}

export function toCatalogDetail(entry: CatalogEntry): CatalogTrainingDetail {
  return { ...toCatalogView(entry), content: entry.content };
}
