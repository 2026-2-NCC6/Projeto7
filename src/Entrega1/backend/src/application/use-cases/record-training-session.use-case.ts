import { DailyStreak } from '../../domain/daily-streak/daily-streak.entity';
import { DailyStreakRepository } from '../../domain/daily-streak/daily-streak-repository.port';
import { GameMode } from '../../domain/game/game-mode';
import { isInfiniteMode } from '../../domain/game/game-mode';
import { TRACK_BY_MODE } from '../../domain/game/session-mode';
import { Progression } from '../../domain/progression/progression.entity';
import { ProgressionRepository } from '../../domain/progression/progression-repository.port';
import { xpForSession } from '../../domain/progression/session-reward';
import { TrainingSession } from '../../domain/training-session/training-session.entity';
import { TrainingSessionRepository } from '../../domain/training-session/training-session-repository.port';
import { UserNotFoundError } from '../../domain/user/errors';
import { UserRepository } from '../../domain/user/user-repository.port';
import { IdGenerator } from '../ports/id-generator.port';
import { toTrackProgressView, TrackProgressView } from './track-progress';

export interface RecordTrainingSessionInput {
  userId: string;
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
  ) {}

  async execute(input: RecordTrainingSessionInput): Promise<RecordedSessionView> {
    const user = await this.users.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

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
