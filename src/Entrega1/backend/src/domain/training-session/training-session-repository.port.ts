import { SessionStats } from './session-stats';

export interface TrainingSessionRepository {
  statsFor(userId: string): Promise<SessionStats>;
}

export const TRAINING_SESSION_REPOSITORY = Symbol('TrainingSessionRepository');
