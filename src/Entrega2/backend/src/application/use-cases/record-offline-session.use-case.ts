import { AuditLog, auditEntry } from '../../domain/audit/audit-event';
import { GameMode, isInfiniteMode } from '../../domain/game/game-mode';
import { TRAINING_STEP_LEVEL } from '../../domain/game/level-access';
import { TrainingRepository } from '../../domain/training/training-repository.port';
import { InvalidTrainingSessionError } from '../../domain/training-session/errors';
import {
  OFFLINE_SYNC_WINDOW_DAYS,
  toSessionAttempt,
  TrainingRef,
} from '../../domain/training-session/session-context';
import { TrainingSession } from '../../domain/training-session/training-session.entity';
import { TrainingSessionRepository } from '../../domain/training-session/training-session-repository.port';
import { UserNotFoundError } from '../../domain/user/errors';
import { UserRepository } from '../../domain/user/user-repository.port';
import { IdGenerator } from '../ports/id-generator.port';
import { RecordTrainingSessionInput, TargetPerformanceInput } from './record-training-session.use-case';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CLOCK_TOLERANCE_MS = 5 * 60 * 1000;

export interface RecordOfflineSessionInput extends Omit<RecordTrainingSessionInput, 'ticket'> {
  clientSessionId: string;
  playedAt: Date;
}

export interface OfflineSessionView {
  id: string;
  xpAwarded: number;
  offline: true;
}

function toTarget(input: TargetPerformanceInput) {
  return {
    targetId: input.targetId,
    attempts: input.attempts,
    correctHits: input.correctHits,
    impactAverage: input.impactAverage ?? null,
    impactPeak: input.impactPeak ?? null,
  };
}

export class RecordOfflineSessionUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: TrainingSessionRepository,
    private readonly trainings: TrainingRepository,
    private readonly ids: IdGenerator,
    private readonly audit: AuditLog,
  ) {}

  private assertPlayedAt(playedAt: Date, durationMs: number): void {
    const now = Date.now();

    if (playedAt.getTime() - durationMs > now + CLOCK_TOLERANCE_MS) {
      throw new InvalidTrainingSessionError('sessão offline no futuro.');
    }
    if (playedAt.getTime() < now - OFFLINE_SYNC_WINDOW_DAYS * ONE_DAY_MS) {
      throw new InvalidTrainingSessionError('sessão offline antiga demais para sincronizar.');
    }
  }

  private async assertStep(training: TrainingRef | null, mode: GameMode, level: number): Promise<void> {
    if (!training) {
      if (!isInfiniteMode(mode) && level < 1) {
        throw new InvalidTrainingSessionError('nível inválido.');
      }
      return;
    }

    const published = await this.trainings.publishedVersion(training.id, training.version);
    const step = published?.content.steps[training.stepIndex];

    if (!step || step.mode !== mode || level !== TRAINING_STEP_LEVEL) {
      throw new InvalidTrainingSessionError('etapa do treino não encontrada.');
    }
  }

  async execute(input: RecordOfflineSessionInput): Promise<OfflineSessionView> {
    if (!(await this.users.findById(input.userId))) {
      throw new UserNotFoundError();
    }

    this.assertPlayedAt(input.playedAt, input.durationMs);
    await this.assertStep(input.training ?? null, input.mode, input.level);

    const session = TrainingSession.record({
      id: this.ids.generate(),
      ticketId: null,
      userId: input.userId,
      mode: input.mode,
      level: input.level,
      cleared: input.cleared,
      score: input.score,
      hits: input.hits,
      misses: input.misses,
      bestStreak: input.bestStreak,
      durationMs: input.durationMs,
      avgResponseMs: input.avgResponseMs ?? null,
      bestResponseMs: input.bestResponseMs ?? null,
      xpAwarded: 0,
      deviceKind: input.deviceKind ?? 'simulated',
      targets: (input.targets ?? []).map(toTarget),
      training: input.training ?? null,
      endReason: input.endReason,
      stopReason: input.stopReason,
      interruptions: input.interruptions,
      offline: true,
      clientSessionId: input.clientSessionId,
      deviceId: input.deviceId,
      attempts: input.attempts?.map(toSessionAttempt),
      playedAt: input.playedAt,
    });

    await this.sessions.commitOffline(session);
    await this.audit.record(
      auditEntry('session.offline_synced', input.userId, { type: 'session', id: session.id }, {
        endReason: session.endReason,
      }),
    );

    return { id: session.id, xpAwarded: 0, offline: true };
  }
}
