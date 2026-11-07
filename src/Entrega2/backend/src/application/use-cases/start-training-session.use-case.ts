import { GameMode } from '../../domain/game/game-mode';
import { isLevelOpen, TRAINING_STEP_LEVEL } from '../../domain/game/level-access';
import { TrainingNotFoundError } from '../../domain/training/errors';
import { TrainingRepository } from '../../domain/training/training-repository.port';
import { InvalidTrainingSessionError } from '../../domain/training-session/errors';
import { TrainingRef } from '../../domain/training-session/session-context';
import { TrainingSessionRepository } from '../../domain/training-session/training-session-repository.port';
import { UserNotFoundError } from '../../domain/user/errors';
import { UserRepository } from '../../domain/user/user-repository.port';
import { IdGenerator } from '../ports/id-generator.port';
import { SessionTickets } from '../ports/session-ticket.port';

export interface StartTrainingSessionInput {
  userId: string;
  mode: GameMode;
  level: number;
  training?: TrainingRef | null;
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
    private readonly trainings: TrainingRepository,
  ) {}

  private async assertTrainingStep(training: TrainingRef, mode: GameMode, level: number): Promise<void> {
    const published = await this.trainings.publishedVersion(training.id, training.version);

    if (!published) {
      throw new TrainingNotFoundError();
    }

    const step = published.content.steps[training.stepIndex];

    if (!step || step.mode !== mode || level !== TRAINING_STEP_LEVEL) {
      throw new InvalidTrainingSessionError('etapa do treino diferente da iniciada.');
    }
  }

  private async assertLevelOpen(userId: string, mode: GameMode, level: number): Promise<void> {
    const { highestClearedByMode } = await this.sessions.insightsFor(userId);

    if (!isLevelOpen(mode, level, highestClearedByMode[mode])) {
      throw new InvalidTrainingSessionError('nível ainda bloqueado.');
    }
  }

  async execute({
    userId,
    mode,
    level,
    training = null,
  }: StartTrainingSessionInput): Promise<StartedSessionView> {
    if (!(await this.users.findById(userId))) {
      throw new UserNotFoundError();
    }

    if (training) {
      await this.assertTrainingStep(training, mode, level);
    } else {
      await this.assertLevelOpen(userId, mode, level);
    }

    const startedAt = new Date();
    const ticket = this.tickets.issue({
      id: this.ids.generate(),
      userId,
      mode,
      level,
      training,
      startedAt,
    });

    return { ticket, startedAt: startedAt.toISOString() };
  }
}
