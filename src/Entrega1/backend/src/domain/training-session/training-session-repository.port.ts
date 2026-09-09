import { CompletedTraining } from './completed-training';
import { SessionInsights } from './session-insights';
import { SessionStats } from './session-stats';

export interface TrainingSessionRepository {
  statsFor(userId: string): Promise<SessionStats>;
  insightsFor(userId: string): Promise<SessionInsights>;
  commit(completed: CompletedTraining): Promise<void>;
}

export const TRAINING_SESSION_REPOSITORY = Symbol('TrainingSessionRepository');
