import { ForbiddenActionError } from '../user/errors';
import { UserRole } from '../user/role';
import { InvalidTrainingError, TrainingTransitionError } from './errors';
import { TrainingContent, trainingContentProblems } from './training-content';

export const TRAINING_STATUSES = ['draft', 'in_review', 'published', 'archived'] as const;

export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

export interface Actor {
  id: string;
  role: UserRole;
}

export interface TrainingProps {
  id: string;
  authorId: string;
  status: TrainingStatus;
  draft: TrainingContent;
  revision: number;
  simulatedRevision: number | null;
  publishedRevision: number | null;
  currentVersion: number;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface TrainingVersion {
  trainingId: string;
  version: number;
  content: TrainingContent;
  publishedAt: Date;
  publishedBy: string;
  changeNote: string;
}

export interface PublishedTraining {
  training: Training;
  version: TrainingVersion;
}

function assertValid(content: TrainingContent): void {
  const problems = trainingContentProblems(content);

  if (problems.length > 0) {
    throw new InvalidTrainingError(problems);
  }
}

export class Training {
  private constructor(private readonly props: TrainingProps) {}

  static restore(props: TrainingProps): Training {
    return new Training(props);
  }

  static create(params: { id: string; author: Actor; content: TrainingContent; now: Date }): Training {
    Training.assertAuthor(params.author);

    return new Training({
      id: params.id,
      authorId: params.author.id,
      status: 'draft',
      draft: params.content,
      revision: 1,
      simulatedRevision: null,
      publishedRevision: null,
      currentVersion: 0,
      reviewNote: null,
      createdAt: params.now,
      updatedAt: params.now,
      publishedAt: null,
    });
  }

  private static assertAuthor(actor: Actor): void {
    if (actor.role !== 'coach' && actor.role !== 'admin') {
      throw new ForbiddenActionError('Só treinadores e administradores criam treinos.');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get status(): TrainingStatus {
    return this.props.status;
  }

  get draft(): TrainingContent {
    return this.props.draft;
  }

  get revision(): number {
    return this.props.revision;
  }

  get simulatedRevision(): number | null {
    return this.props.simulatedRevision;
  }

  get publishedRevision(): number | null {
    return this.props.publishedRevision;
  }

  get currentVersion(): number {
    return this.props.currentVersion;
  }

  get reviewNote(): string | null {
    return this.props.reviewNote;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get publishedAt(): Date | null {
    return this.props.publishedAt;
  }

  get isListed(): boolean {
    return this.props.currentVersion > 0 && this.props.status !== 'archived';
  }

  get isSimulated(): boolean {
    return this.props.simulatedRevision === this.props.revision;
  }

  get hasUnpublishedChanges(): boolean {
    return this.props.publishedRevision !== this.props.revision;
  }

  assertManageableBy(actor: Actor): void {
    if (actor.role !== 'admin' && actor.id !== this.props.authorId) {
      throw new ForbiddenActionError('Este treino pertence a outro autor.');
    }
  }

  private assertNotArchived(): void {
    if (this.props.status === 'archived') {
      throw new TrainingTransitionError('Restaure o treino arquivado antes de alterá-lo.');
    }
  }

  private with(changes: Partial<TrainingProps>, now: Date): Training {
    return new Training({ ...this.props, ...changes, updatedAt: now });
  }

  edit(actor: Actor, content: TrainingContent, now: Date): Training {
    this.assertManageableBy(actor);
    this.assertNotArchived();

    return this.with(
      { draft: content, revision: this.props.revision + 1, status: 'draft', reviewNote: null },
      now,
    );
  }

  recordSimulation(actor: Actor, revision: number, passed: boolean, now: Date): Training {
    this.assertManageableBy(actor);
    this.assertNotArchived();

    if (revision !== this.props.revision) {
      throw new TrainingTransitionError('A simulação foi feita em uma versão antiga do rascunho.');
    }

    return this.with({ simulatedRevision: passed ? revision : null }, now);
  }

  submitForReview(actor: Actor, now: Date): Training {
    this.assertManageableBy(actor);

    if (this.props.status !== 'draft') {
      throw new TrainingTransitionError('Só um rascunho pode ser enviado para revisão.');
    }

    this.assertReadyToPublish();
    return this.with({ status: 'in_review', reviewNote: null }, now);
  }

  private assertReadyToPublish(): void {
    assertValid(this.props.draft);

    if (!this.isSimulated) {
      throw new TrainingTransitionError('Simule o treino até o fim antes de publicá-lo.');
    }
  }

  publish(actor: Actor, changeNote: string, now: Date): PublishedTraining {
    if (actor.role !== 'admin') {
      throw new ForbiddenActionError('Só administradores publicam treinos.');
    }

    const fromReview = this.props.status === 'in_review';
    const ownDraft = this.props.status === 'draft' && actor.id === this.props.authorId;

    if (!fromReview && !ownDraft) {
      throw new TrainingTransitionError('O treino precisa estar em revisão para ser publicado.');
    }

    this.assertReadyToPublish();

    const version = this.props.currentVersion + 1;
    const training = this.with(
      {
        status: 'published',
        currentVersion: version,
        publishedRevision: this.props.revision,
        publishedAt: now,
        reviewNote: null,
      },
      now,
    );

    return {
      training,
      version: {
        trainingId: this.props.id,
        version,
        content: this.props.draft,
        publishedAt: now,
        publishedBy: actor.id,
        changeNote: changeNote.trim(),
      },
    };
  }

  returnToDraft(actor: Actor, note: string, now: Date): Training {
    if (actor.role !== 'admin') {
      throw new ForbiddenActionError('Só administradores devolvem treinos em revisão.');
    }
    if (this.props.status !== 'in_review') {
      throw new TrainingTransitionError('Só um treino em revisão pode ser devolvido.');
    }

    return this.with({ status: 'draft', reviewNote: note.trim() }, now);
  }

  archive(actor: Actor, now: Date): Training {
    this.assertManageableBy(actor);
    this.assertNotArchived();

    return this.with({ status: 'archived' }, now);
  }

  restore(actor: Actor, now: Date): Training {
    this.assertManageableBy(actor);

    if (this.props.status !== 'archived') {
      throw new TrainingTransitionError('O treino não está arquivado.');
    }

    const upToDate = this.props.currentVersion > 0 && !this.hasUnpublishedChanges;
    return this.with({ status: upToDate ? 'published' : 'draft' }, now);
  }
}
