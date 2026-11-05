import type { TrainingDifficulty, TrainingStep } from '../../gameplay/training/training-step';
import type { TargetColor } from '../../types/game';

export type TrainingAudience = 'kids' | 'teens' | 'adults' | 'seniors' | 'all';

export interface CatalogTraining {
  id: string;
  version: number;
  title: string;
  summary: string;
  audience: TrainingAudience;
  difficulty: TrainingDifficulty;
  estimatedMinutes: number;
  stepCount: number;
  targetColors: TargetColor[];
  authorName: string;
}

export interface TrainingDetail extends CatalogTraining {
  content: {
    instructions: string;
    scoringRules: string;
    equipment: string[];
    risks: string[];
    steps: TrainingStep[];
  };
}

export interface Cached<T> {
  data: T;
  fromCache: boolean;
}
