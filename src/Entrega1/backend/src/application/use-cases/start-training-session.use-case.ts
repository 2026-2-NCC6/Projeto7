import { GameMode } from '../../domain/game/game-mode';
import { isLevelOpen } from '../../domain/game/level-access';
import { InvalidTrainingSessionError } from '../../domain/training-session/errors';
import { TrainingSessionRepository } from '../../domain/training-session/training-session-repository.port';
import { UserNotFoundError } from '../../domain/user/errors';
import { UserRepository } from '../../domain/user/user-repository.port';
import { IdGenerator } from '../ports/id-generator.port';
import { SessionTickets } from '../ports/session-ticket.port';

export interface StartTrainingSessionInput {
  userId: string;
  mode: GameMode;
  level: number;
}

export interface StartedSessionView {
  ticket: string;
  startedAt: string;
}

/**
 * Opens a session before it is played. The server, not the app, decides
 * whether the level is open and when the clock started; the ticket it returns
 * is the only way to record the result afterwards.
 */
export class StartTrainingSessionUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: TrainingSessionRepository,
    private readonly tickets: SessionTickets,
    private readonly ids: IdGenerator,
  ) {}

  async execute({ userId, mode, level }: StartTrainingSessionInput): Promise<StartedSessionView> {
    if (!(await this.users.findById(userId))) {
      throw new UserNotFoundError();
    }

    const { highestClearedByMode } = await this.sessions.insightsFor(userId);

    if (!isLevelOpen(mode, level, highestClearedByMode[mode])) {
      throw new InvalidTrainingSessionError('nível ainda bloqueado.');
    }

    const startedAt = new Date();
    const ticket = this.tickets.issue({ id: this.ids.generate(), userId, mode, level, startedAt });

    return { ticket, startedAt: startedAt.toISOString() };
  }
}
