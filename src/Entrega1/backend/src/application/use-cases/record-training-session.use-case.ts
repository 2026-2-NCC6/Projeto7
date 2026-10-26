import { DailyStreak } from '../../domain/daily-streak/daily-streak.entity';
import { DailyStreakRepository } from '../../domain/daily-streak/daily-streak-repository.port';
import { GameMode } from '../../domain/game/game-mode';
import { isInfiniteMode } from '../../domain/game/game-mode';
import { TRACK_BY_MODE } from '../../domain/game/session-mode';
import { Progression } from '../../domain/progression/progression.entity';
import { ProgressionRepository } from '../../domain/progression/progression-repository.port';
import { xpForSession } from '../../domain/progression/session-reward';
import { DeviceKind } from '../../domain/training-session/device-kind';
import { InvalidTrainingSessionError } from '../../domain/training-session/errors';
import { TargetPerformance } from '../../domain/training-session/target-performance';
import { TrainingSession } from '../../domain/training-session/training-session.entity';
import { TrainingSessionRepository } from '../../domain/training-session/training-session-repository.port';
import { UserNotFoundError } from '../../domain/user/errors';
import { UserRepository } from '../../domain/user/user-repository.port';
import { IdGenerator } from '../ports/id-generator.port';
import { SessionTicket, SessionTickets } from '../ports/session-ticket.port';
import { toTrackProgressView, TrackProgressView } from './track-progress';

/** The app starts its clock a moment before the ticket comes back; this covers the round trip. */
const CLOCK_TOLERANCE_MS = 5_000;

export interface RecordTrainingSessionInput {
  userId: string;
  /** Returned by StartTrainingSessionUseCase when the session was opened. */
  ticket: string;
  mode: GameMode;
  level: number;
  cleared: boolean;
  score: number;
  hits: number;
  misses: number;
  bestStreak: number;
  durationMs: number;
  avgResponseMs?: number | null;
  bestResponseMs?: number | null;
  deviceKind?: DeviceKind;
  targets?: TargetPerformanceInput[];
}

export interface TargetPerformanceInput {
  targetId: number;
  attempts: number;
  correctHits: number;
  impactAverage?: number | null;
  impactPeak?: number | null;
}

function toTargetPerformance(input: TargetPerformanceInput): TargetPerformance {
  return {
    targetId: input.targetId,
    attempts: input.attempts,
    correctHits: input.correctHits,
    impactAverage: input.impactAverage ?? null,
    impactPeak: input.impactPeak ?? null,
  };
}

export interface DailyStreakView {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

export interface RecordedSessionView {
  xpAwarded: number;
  progression: TrackProgressView;
  leveledUp: boolean;
  dailyStreak: DailyStreakView;
}

export class RecordTrainingSessionUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly progressions: ProgressionRepository,
    private readonly dailyStreaks: DailyStreakRepository,
    private readonly sessions: TrainingSessionRepository,
    private readonly ids: IdGenerator,
    private readonly tickets: SessionTickets,
  ) {}

  /** The session must be the one opened on the server, and no longer than the time since then. */
  private openedTicketFor(input: RecordTrainingSessionInput): SessionTicket {
    const ticket = this.tickets.verify(input.ticket);

    if (!ticket || ticket.userId !== input.userId) {
      throw new InvalidTrainingSessionError('a sessão não foi iniciada no servidor.');
    }
    if (ticket.mode !== input.mode || ticket.level !== input.level) {
      throw new InvalidTrainingSessionError('modo ou nível diferente do iniciado.');
    }
    if (input.durationMs > Date.now() - ticket.startedAt.getTime() + CLOCK_TOLERANCE_MS) {
      throw new InvalidTrainingSessionError('duração maior que o tempo desde o início.');
    }

    return ticket;
  }

  async execute(input: RecordTrainingSessionInput): Promise<RecordedSessionView> {
    const user = await this.users.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const ticket = this.openedTicketFor(input);

    const track = TRACK_BY_MODE[input.mode];
    const [existingProgression, existingStreak] = await Promise.all([
      this.progressions.findByTrack(input.userId, track),
      this.dailyStreaks.findByUser(input.userId),
    ]);

    const progression = existingProgression ?? Progression.start(input.userId, track);
    const streak = existingStreak ?? DailyStreak.start(input.userId);

    const xpAwarded = xpForSession(input);
    const rewarded = progression.award(xpAwarded);
    const day = new Date();

    const session = TrainingSession.record({
      id: this.ids.generate(),
      ticketId: ticket.id,
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
      xpAwarded,
      deviceKind: input.deviceKind ?? 'simulated',
      targets: (input.targets ?? []).map(toTargetPerformance),
    });

    // Treinar conta como o dia cumprido; um nível não concluído não mantém a
    // ofensiva. Um modo infinito nunca é "concluído", então a série terminada já
    // conta o dia.
    const nextStreak =
      input.cleared || isInfiniteMode(input.mode) ? streak.completeOn(day) : streak;

    await this.sessions.commit({
      session,
      progression: rewarded,
      dailyStreak: nextStreak,
    });

    return {
      xpAwarded,
      progression: toTrackProgressView(rewarded),
      leveledUp: rewarded.level > progression.level,
      dailyStreak: {
        currentStreak: nextStreak.currentStreak,
        longestStreak: nextStreak.longestStreak,
        completedToday: nextStreak.isCompletedOn(day),
      },
    };
  }
}
