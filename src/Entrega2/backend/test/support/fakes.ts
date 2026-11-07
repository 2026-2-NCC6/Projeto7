import { IdGenerator } from '../../src/application/ports/id-generator.port';
import { SessionTicket, SessionTickets } from '../../src/application/ports/session-ticket.port';
import { DailyStreak } from '../../src/domain/daily-streak/daily-streak.entity';
import { DailyStreakRepository } from '../../src/domain/daily-streak/daily-streak-repository.port';
import { ProgressionTrack } from '../../src/domain/game/game-mode';
import { Progression } from '../../src/domain/progression/progression.entity';
import { ProgressionRepository } from '../../src/domain/progression/progression-repository.port';
import { LeaderboardEntry, Standings } from '../../src/domain/ranking/leaderboard';
import { RankingCategory } from '../../src/domain/ranking/ranking-category';
import { RankingRepository } from '../../src/domain/ranking/ranking-repository.port';
import { StatisticsRepository } from '../../src/domain/statistics/statistics-repository.port';
import { StatisticsScope } from '../../src/domain/statistics/statistics-scope';
import {
  ActivitySummary,
  DailyActivity,
  ModeBreakdown,
  RecentSession,
  TargetBreakdown,
} from '../../src/domain/statistics/training-statistics';
import { CompletedTraining } from '../../src/domain/training-session/completed-training';
import { SessionAlreadyRecordedError } from '../../src/domain/training-session/errors';
import { EMPTY_SESSION_INSIGHTS, SessionInsights } from '../../src/domain/training-session/session-insights';
import { EMPTY_SESSION_STATS, SessionStats } from '../../src/domain/training-session/session-stats';
import { TrainingSessionRepository } from '../../src/domain/training-session/training-session-repository.port';
import { Account } from '../../src/domain/user/account';
import { User } from '../../src/domain/user/user.entity';
import {
  UserListFilter,
  UserPage,
  UserRepository,
} from '../../src/domain/user/user-repository.port';
import { AuditEntry, AuditEvent, AuditLog } from '../../src/domain/audit/audit-event';
import { EMPTY_PRACTITIONER_PROFILE } from '../../src/domain/user/practitioner-profile';
import { USER_ROLES, UserRole } from '../../src/domain/user/role';
import { TrainingContent } from '../../src/domain/training/training-content';
import {
  CatalogEntry,
  StepBreakdown,
  StudioEntry,
  TrainingRepository,
  VersionEntry,
} from '../../src/domain/training/training-repository.port';
import {
  Training,
  TRAINING_STATUSES,
  TrainingStatus,
  TrainingVersion,
} from '../../src/domain/training/training.entity';
import { TrainingSession } from '../../src/domain/training-session/training-session.entity';

export function aUser(id: string, name = `Player ${id}`, role: UserRole = 'player'): User {
  return User.restore({
    id,
    name,
    email: `${id}@smash.test`,
    passwordHash: 'hash',
    tokenVersion: 0,
    role,
    profile: EMPTY_PRACTITIONER_PROFILE,
    createdAt: new Date('2026-01-10T12:00:00.000Z'),
  });
}

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[] = []) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async register(account: Account): Promise<void> {
    this.users.push(account.user);
  }

  async revokeTokens(userId: string): Promise<void> {
    const index = this.users.findIndex((user) => user.id === userId);
    const user = this.users[index];

    if (user) {
      this.users[index] = User.restore({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        tokenVersion: user.tokenVersion + 1,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      });
    }
  }

  async save(user: User): Promise<void> {
    const index = this.users.findIndex((existing) => existing.id === user.id);
    this.users[index] = user;
  }

  async list({ limit, offset }: UserListFilter): Promise<UserPage> {
    return {
      total: this.users.length,
      items: this.users.slice(offset, offset + limit).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ageGroup: user.profile.ageGroup,
        sessions: 0,
        lastPlayedAt: null,
        createdAt: user.createdAt,
      })),
    };
  }

  async countByRole(): Promise<Record<UserRole, number>> {
    return USER_ROLES.reduce(
      (counts, role) => ({ ...counts, [role]: this.users.filter((user) => user.role === role).length }),
      {} as Record<UserRole, number>,
    );
  }
}

export class InMemoryProgressionRepository implements ProgressionRepository {
  constructor(private readonly progressions: Progression[] = []) {}

  async findByUser(userId: string): Promise<Progression[]> {
    return this.progressions.filter((progression) => progression.userId === userId);
  }

  async findByTrack(userId: string, track: ProgressionTrack): Promise<Progression | null> {
    return (
      this.progressions.find(
        (progression) => progression.userId === userId && progression.track === track,
      ) ?? null
    );
  }
}

export class InMemoryDailyStreakRepository implements DailyStreakRepository {
  constructor(private readonly streaks: DailyStreak[] = []) {}

  async findByUser(userId: string): Promise<DailyStreak | null> {
    return this.streaks.find((streak) => streak.userId === userId) ?? null;
  }
}

export class InMemoryTrainingSessionRepository implements TrainingSessionRepository {
  readonly committed: CompletedTraining[] = [];

  constructor(private readonly insights: SessionInsights = EMPTY_SESSION_INSIGHTS) {}

  async statsFor(): Promise<SessionStats> {
    return EMPTY_SESSION_STATS;
  }

  async insightsFor(): Promise<SessionInsights> {
    return this.insights;
  }

  async commit(completed: CompletedTraining): Promise<void> {
    const { ticketId } = completed.session;

    if (ticketId && this.committed.some(({ session }) => session.ticketId === ticketId)) {
      throw new SessionAlreadyRecordedError();
    }
    this.committed.push(completed);
  }

  readonly offline: TrainingSession[] = [];

  async commitOffline(session: TrainingSession): Promise<void> {
    if (this.offline.some((existing) => existing.clientSessionId === session.clientSessionId)) {
      throw new SessionAlreadyRecordedError();
    }
    this.offline.push(session);
  }
}

/** Tickets are kept by token, so a test can forge a stale or foreign one directly. */
export class InMemorySessionTickets implements SessionTickets {
  private readonly issued = new Map<string, SessionTicket>();

  issue(ticket: SessionTicket): string {
    const token = `ticket-${ticket.id}`;
    this.issued.set(token, ticket);
    return token;
  }

  verify(token: string): SessionTicket | null {
    return this.issued.get(token) ?? null;
  }
}

export class InMemoryRankingRepository implements RankingRepository {
  constructor(private readonly board: Partial<Record<RankingCategory, LeaderboardEntry[]>> = {}) {}

  async standings(category: RankingCategory, limit: number): Promise<Standings> {
    const entries = this.board[category] ?? [];
    return { entries: entries.slice(0, limit), total: entries.length };
  }

  async standingOf(category: RankingCategory, userId: string): Promise<LeaderboardEntry | null> {
    return (this.board[category] ?? []).find((entry) => entry.userId === userId) ?? null;
  }

  async rankedCount(category: RankingCategory): Promise<number> {
    return (this.board[category] ?? []).length;
  }
}

export const EMPTY_SUMMARY: ActivitySummary = {
  sessions: 0,
  playTimeMs: 0,
  hits: 0,
  misses: 0,
  accuracyPercent: null,
  averageResponseMs: null,
  bestResponseMs: null,
  xpEarned: 0,
  totalScore: 0,
  bestScore: null,
  longestHitStreak: 0,
  hardwareSessions: 0,
  firstPlayedAt: null,
  lastPlayedAt: null,
};

export interface StatisticsFixture {
  summary: ActivitySummary;
  modes: ModeBreakdown[];
  activity: DailyActivity[];
  targets: TargetBreakdown[];
  recentSessions: RecentSession[];
}

export class InMemoryStatisticsRepository implements StatisticsRepository {
  readonly scopes: StatisticsScope[] = [];
  since: Date | null = null;

  constructor(
    private readonly fixture: StatisticsFixture = {
      summary: EMPTY_SUMMARY,
      modes: [],
      activity: [],
      targets: [],
      recentSessions: [],
    },
  ) {}

  async summaryFor(scope: StatisticsScope): Promise<ActivitySummary> {
    this.scopes.push(scope);
    return this.fixture.summary;
  }

  async modesFor(): Promise<ModeBreakdown[]> {
    return this.fixture.modes;
  }

  async dailyActivityFor(_scope: StatisticsScope, since: Date): Promise<DailyActivity[]> {
    this.since = since;
    return this.fixture.activity;
  }

  async targetsFor(): Promise<TargetBreakdown[]> {
    return this.fixture.targets;
  }

  async recentSessionsFor(_scope: StatisticsScope, limit: number): Promise<RecentSession[]> {
    return this.fixture.recentSessions.slice(0, limit);
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private next = 0;

  generate(): string {
    this.next += 1;
    return `id-${this.next}`;
  }
}

export function rankedEntries(count: number): LeaderboardEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    position: index + 1,
    userId: `user-${index + 1}`,
    name: `Player ${index + 1}`,
    minor: false,
    value: (count - index) * 100,
  }));
}

export class InMemoryAuditLog implements AuditLog {
  readonly entries: AuditEntry[] = [];

  async record(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }

  async list(): Promise<AuditEvent[]> {
    return [];
  }
}

export class InMemoryTrainingRepository implements TrainingRepository {
  readonly trainings = new Map<string, Training>();
  readonly versions: TrainingVersion[] = [];

  async findById(id: string): Promise<Training | null> {
    return this.trainings.get(id) ?? null;
  }

  async save(training: Training): Promise<void> {
    this.trainings.set(training.id, training);
  }

  async publish(training: Training, version: TrainingVersion): Promise<void> {
    this.versions.push(version);
    this.trainings.set(training.id, training);
  }

  async studio(): Promise<StudioEntry[]> {
    return [...this.trainings.values()].map((training) => ({ training, authorName: 'Autor', sessions: 0 }));
  }

  async studioEntry(id: string): Promise<StudioEntry | null> {
    const training = this.trainings.get(id);
    return training ? { training, authorName: 'Autor', sessions: 0 } : null;
  }

  async catalog(): Promise<CatalogEntry[]> {
    return [];
  }

  async publishedVersion(id: string, version?: number): Promise<CatalogEntry | null> {
    const training = this.trainings.get(id);
    const wanted = version ?? training?.currentVersion;
    const found = this.versions.find((entry) => entry.trainingId === id && entry.version === wanted);

    if (!training?.isListed || !found) {
      return null;
    }

    return {
      id,
      version: found.version,
      content: found.content as TrainingContent,
      authorName: 'Autor',
      publishedAt: found.publishedAt,
      sessions: 0,
    };
  }

  async versionsOf(id: string): Promise<VersionEntry[]> {
    return this.versions
      .filter((entry) => entry.trainingId === id)
      .map((entry) => ({
        version: entry.version,
        publishedAt: entry.publishedAt,
        publishedByName: 'Admin',
        changeNote: entry.changeNote,
      }));
  }

  async stepBreakdownOf(): Promise<StepBreakdown[]> {
    return [];
  }

  async countByStatus(): Promise<Record<TrainingStatus, number>> {
    return TRAINING_STATUSES.reduce(
      (counts, status) => ({ ...counts, [status]: 0 }),
      {} as Record<TrainingStatus, number>,
    );
  }
}
