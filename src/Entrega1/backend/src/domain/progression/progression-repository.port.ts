import { Progression } from './progression.entity';

export interface ProgressionRepository {
  findByUser(userId: string): Promise<Progression[]>;
}

export const PROGRESSION_REPOSITORY = Symbol('ProgressionRepository');
