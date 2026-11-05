import { AuditAction, AuditLog, auditEntry } from '../../domain/audit/audit-event';
import {
  activityWindowStart,
  completeTargetBreakdown,
  fillActivityWindow,
} from '../../domain/statistics/statistics-rules';
import { StatisticsRepository } from '../../domain/statistics/statistics-repository.port';
import { trainingScope } from '../../domain/statistics/statistics-scope';
import {
  ActivitySummary,
  DailyActivity,
  TargetBreakdown,
} from '../../domain/statistics/training-statistics';
import { TrainingNotFoundError } from '../../domain/training/errors';
import { TrainingContent } from '../../domain/training/training-content';
import {
  StepBreakdown,
  TrainingRepository,
} from '../../domain/training/training-repository.port';
import { Actor, Training, TrainingStatus } from '../../domain/training/training.entity';
import {
  SessionHistoryRepository,
  SessionSummary,
} from '../../domain/training-session/session-history';
import { UserRepository } from '../../domain/user/user-repository.port';
import { IdGenerator } from '../ports/id-generator.port';
import { actorOf, assertRole } from './actor';
import { StudioTrainingView, toStudioEntryView, VersionView } from './training-views';

const ANALYTICS_WINDOW_DAYS = 30;
const RECENT_SESSIONS = 20;

export interface TrainingAnalyticsView {
  summary: ActivitySummary;
  activity: DailyActivity[];
  targets: TargetBreakdown[];
  steps: StepBreakdown[];
  recentSessions: SessionSummary[];
}

export interface StudioDetailView extends StudioTrainingView {
  versions: VersionView[];
}

export class TrainingStudio {
  constructor(
    private readonly users: UserRepository,
    private readonly trainings: TrainingRepository,
    private readonly statistics: StatisticsRepository,
    private readonly history: SessionHistoryRepository,
    private readonly ids: IdGenerator,
    private readonly audit: AuditLog,
  ) {}

  private async author(userId: string): Promise<Actor> {
    const actor = await actorOf(this.users, userId);
    assertRole(actor, 'coach', 'admin');
    return actor;
  }

  private async load(id: string): Promise<Training> {
    const training = await this.trainings.findById(id);

    if (!training) {
      throw new TrainingNotFoundError();
    }

    return training;
  }

  private async view(id: string): Promise<StudioDetailView> {
    const entry = await this.trainings.studioEntry(id);

    if (!entry) {
      throw new TrainingNotFoundError();
    }

    return { ...toStudioEntryView(entry), versions: await this.trainings.versionsOf(id) };
  }

  private async change(
    userId: string,
    id: string,
    action: AuditAction,
    apply: (training: Training, actor: Actor, now: Date) => Training,
    details: Record<string, unknown> = {},
  ): Promise<StudioDetailView> {
    const actor = await this.author(userId);
    const training = apply(await this.load(id), actor, new Date());

    await this.trainings.save(training);
    await this.audit.record(auditEntry(action, actor.id, { type: 'training', id }, details));

    return this.view(id);
  }

  async list(userId: string, status?: TrainingStatus): Promise<StudioTrainingView[]> {
    const actor = await this.author(userId);
    const entries = await this.trainings.studio({
      status,
      authorId: actor.role === 'admin' ? undefined : actor.id,
    });

    return entries.map(toStudioEntryView);
  }

  async detail(userId: string, id: string): Promise<StudioDetailView> {
    const actor = await this.author(userId);
    (await this.load(id)).assertManageableBy(actor);
    return this.view(id);
  }

  async create(userId: string, content: TrainingContent): Promise<StudioDetailView> {
    const actor = await this.author(userId);
    const training = Training.create({ id: this.ids.generate(), author: actor, content, now: new Date() });

    await this.trainings.save(training);
    await this.audit.record(
      auditEntry('training.created', actor.id, { type: 'training', id: training.id }, {
        title: content.title,
      }),
    );

    return this.view(training.id);
  }

  update(userId: string, id: string, content: TrainingContent): Promise<StudioDetailView> {
    return this.change(userId, id, 'training.updated', (training, actor, now) =>
      training.edit(actor, content, now),
    );
  }

  simulate(userId: string, id: string, revision: number, passed: boolean): Promise<StudioDetailView> {
    return this.change(
      userId,
      id,
      'training.simulated',
      (training, actor, now) => training.recordSimulation(actor, revision, passed, now),
      { revision, passed },
    );
  }

  submit(userId: string, id: string): Promise<StudioDetailView> {
    return this.change(userId, id, 'training.submitted', (training, actor, now) =>
      training.submitForReview(actor, now),
    );
  }

  returnToDraft(userId: string, id: string, note: string): Promise<StudioDetailView> {
    return this.change(
      userId,
      id,
      'training.returned',
      (training, actor, now) => training.returnToDraft(actor, note, now),
      { note },
    );
  }

  archive(userId: string, id: string): Promise<StudioDetailView> {
    return this.change(userId, id, 'training.archived', (training, actor, now) =>
      training.archive(actor, now),
    );
  }

  restore(userId: string, id: string): Promise<StudioDetailView> {
    return this.change(userId, id, 'training.restored', (training, actor, now) =>
      training.restore(actor, now),
    );
  }

  async publish(userId: string, id: string, changeNote: string): Promise<StudioDetailView> {
    const actor = await this.author(userId);
    const { training, version } = (await this.load(id)).publish(actor, changeNote, new Date());

    await this.trainings.publish(training, version);
    await this.audit.record(
      auditEntry('training.published', actor.id, { type: 'training', id }, {
        version: version.version,
        changeNote: version.changeNote,
      }),
    );

    return this.view(id);
  }

  async analytics(userId: string, id: string): Promise<TrainingAnalyticsView> {
    const actor = await this.author(userId);
    (await this.load(id)).assertManageableBy(actor);

    const scope = trainingScope(id);
    const today = new Date();
    const [summary, activity, targets, steps, recent] = await Promise.all([
      this.statistics.summaryFor(scope),
      this.statistics.dailyActivityFor(scope, activityWindowStart(today, ANALYTICS_WINDOW_DAYS)),
      this.statistics.targetsFor(scope),
      this.trainings.stepBreakdownOf(id),
      this.history.list({ trainingId: id, limit: RECENT_SESSIONS, offset: 0 }),
    ]);

    return {
      summary,
      activity: fillActivityWindow(activity, today, ANALYTICS_WINDOW_DAYS),
      targets: completeTargetBreakdown(targets),
      steps,
      recentSessions: recent.items,
    };
  }
}
