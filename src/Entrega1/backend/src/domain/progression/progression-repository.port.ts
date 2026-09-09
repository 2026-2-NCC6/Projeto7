import { ProgressionTrack } from '../game/game-mode';
import { Progression } from './progression.entity';

export interface ProgressionRepository {
  findByUser(userId: string): Promise<Progression[]>;
  findByTrack(userId: string, track: ProgressionTrack): Promise<Progression | null>;
}

export const PROGRESSION_REPOSITORY = Symbol('ProgressionRepository');
