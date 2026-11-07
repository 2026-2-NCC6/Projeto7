import { GameMode } from '../../domain/game/game-mode';
import { TrainingRef } from '../../domain/training-session/session-context';

/**
 * Proof, signed by the API, that a training session was opened before it was
 * played: who opened it, for which mode and level, and when.
 */
export interface SessionTicket {
  id: string;
  userId: string;
  mode: GameMode;
  level: number;
  training: TrainingRef | null;
  startedAt: Date;
}

export interface SessionTickets {
  issue(ticket: SessionTicket): string;
  /** The ticket inside a token, or null when it is forged, tampered with or expired. */
  verify(token: string): SessionTicket | null;
}

export const SESSION_TICKETS = Symbol('SessionTickets');
