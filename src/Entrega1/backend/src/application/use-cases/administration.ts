import { AuditEvent, AuditFilter, AuditLog, auditEntry } from '../../domain/audit/audit-event';
import {
  activityWindowStart,
  completeModeBreakdown,
  completeTargetBreakdown,
  fillActivityWindow,
} from '../../domain/statistics/statistics-rules';
import { StatisticsRepository } from '../../domain/statistics/statistics-repository.port';
import { ALL_SCOPE } from '../../domain/statistics/statistics-scope';
import {
  ActivitySummary,
  DailyActivity,
  ModeBreakdown,
  TargetBreakdown,
} from '../../domain/statistics/training-statistics';
import { TrainingRepository } from '../../domain/training/training-repository.port';
import { TrainingStatus } from '../../domain/training/training.entity';
import {
  DeviceUsage,
  OperationCounts,
  SessionHistoryFilter,
  SessionHistoryRepository,
  SessionPage,
} from '../../domain/training-session/session-history';
import { ForbiddenActionError, UserNotFoundError } from '../../domain/user/errors';
import { UserRole } from '../../domain/user/role';
import { UserListFilter, UserPage, UserRepository } from '../../domain/user/user-repository.port';
import { actorOf, assertRole } from './actor';

const OVERVIEW_WINDOW_DAYS = 30;

export interface AdminOverview {
  summary: ActivitySummary;
  activity: DailyActivity[];
  modes: ModeBreakdown[];
  targets: TargetBreakdown[];
  usersByRole: Record<UserRole, number>;
  trainingsByStatus: Record<TrainingStatus, number>;
  operations: OperationCounts;
}

export class Administration {
  constructor(
    private readonly users: UserRepository,
    private readonly trainings: TrainingRepository,
    private readonly statistics: StatisticsRepository,
    private readonly history: SessionHistoryRepository,
    private readonly audit: AuditLog,
  ) {}

  private async admin(userId: string): Promise<void> {
    assertRole(await actorOf(this.users, userId), 'admin');
  }

  async userPage(userId: string, filter: UserListFilter): Promise<UserPage> {
    await this.admin(userId);
    return this.users.list(filter);
  }

  async changeRole(userId: string, targetId: string, role: UserRole): Promise<void> {
    await this.admin(userId);

    if (targetId === userId) {
      throw new ForbiddenActionError('Você não pode mudar o próprio papel.');
    }

    const target = await this.users.findById(targetId);

    if (!target) {
      throw new UserNotFoundError();
    }

    await this.users.save(target.withRole(role));
    await this.audit.record(
      auditEntry('user.role_changed', userId, { type: 'user', id: targetId }, {
        from: target.role,
        to: role,
      }),
    );
  }

  async overview(userId: string): Promise<AdminOverview> {
    await this.admin(userId);

    const today = new Date();
    const [summary, activity, modes, targets, usersByRole, trainingsByStatus, operations] =
      await Promise.all([
        this.statistics.summaryFor(ALL_SCOPE),
        this.statistics.dailyActivityFor(ALL_SCOPE, activityWindowStart(today, OVERVIEW_WINDOW_DAYS)),
        this.statistics.modesFor(ALL_SCOPE),
        this.statistics.targetsFor(ALL_SCOPE),
        this.users.countByRole(),
        this.trainings.countByStatus(),
        this.history.operationCounts(),
      ]);

    return {
      summary,
      activity: fillActivityWindow(activity, today, OVERVIEW_WINDOW_DAYS),
      modes: completeModeBreakdown(modes),
      targets: completeTargetBreakdown(targets),
      usersByRole,
      trainingsByStatus,
      operations,
    };
  }

  async sessions(userId: string, filter: SessionHistoryFilter): Promise<SessionPage> {
    await this.admin(userId);
    return this.history.list(filter);
  }

  async devices(userId: string): Promise<DeviceUsage[]> {
    await this.admin(userId);
    return this.history.devices();
  }

  async auditTrail(userId: string, filter: AuditFilter): Promise<AuditEvent[]> {
    await this.admin(userId);
    return this.audit.list(filter);
  }
}
