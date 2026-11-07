import { DataSource } from 'typeorm';
import { TrainingContent } from '../../../domain/training/training-content';
import {
  CatalogEntry,
  CatalogFilter,
  StepBreakdown,
  StudioEntry,
  StudioFilter,
  TrainingRepository,
  VersionEntry,
} from '../../../domain/training/training-repository.port';
import {
  Training,
  TRAINING_STATUSES,
  TrainingStatus,
  TrainingVersion,
} from '../../../domain/training/training.entity';

interface TrainingRow {
  id: string;
  author_id: string;
  status: TrainingStatus;
  draft: TrainingContent;
  revision: number;
  simulated_revision: number | null;
  published_revision: number | null;
  current_version: number;
  review_note: string | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

interface StudioRow extends TrainingRow {
  author_name: string;
  sessions: string;
}

interface CatalogRow {
  id: string;
  version: number;
  content: TrainingContent;
  author_name: string;
  published_at: Date;
  sessions: string;
}

interface VersionRow {
  version: number;
  published_at: Date;
  published_by_name: string | null;
  change_note: string;
}

interface StepRow {
  training_version: number;
  step_index: number;
  sessions: string;
  cleared_sessions: string;
  hits: string;
  misses: string;
  average_score: string | null;
}

const STUDIO_SELECT = `
  SELECT training.*, author.name AS author_name,
    (SELECT COUNT(*) FROM training_sessions session WHERE session.training_id = training.id) AS sessions
  FROM trainings training
  JOIN users author ON author.id = training.author_id`;

const CATALOG_SELECT = `
  SELECT training.id, version.version, version.content, author.name AS author_name,
    version.published_at,
    (SELECT COUNT(*) FROM training_sessions session WHERE session.training_id = training.id) AS sessions
  FROM trainings training
  JOIN training_versions version ON version.training_id = training.id
  JOIN users author ON author.id = training.author_id
  WHERE training.current_version > 0 AND training.status <> 'archived'`;

function toTraining(row: TrainingRow): Training {
  return Training.restore({
    id: row.id,
    authorId: row.author_id,
    status: row.status,
    draft: row.draft,
    revision: row.revision,
    simulatedRevision: row.simulated_revision,
    publishedRevision: row.published_revision,
    currentVersion: row.current_version,
    reviewNote: row.review_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  });
}

function toStudioEntry(row: StudioRow): StudioEntry {
  return { training: toTraining(row), authorName: row.author_name, sessions: Number(row.sessions) };
}

function toCatalogEntry(row: CatalogRow): CatalogEntry {
  return {
    id: row.id,
    version: row.version,
    content: row.content,
    authorName: row.author_name,
    publishedAt: row.published_at,
    sessions: Number(row.sessions),
  };
}

type Query = (sql: string, params: unknown[]) => Promise<unknown>;

async function upsertTraining(query: Query, training: Training): Promise<void> {
  await query(
    `INSERT INTO trainings (id, author_id, status, draft, revision, simulated_revision,
       published_revision, current_version, review_note, created_at, updated_at, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status,
       draft = EXCLUDED.draft,
       revision = EXCLUDED.revision,
       simulated_revision = EXCLUDED.simulated_revision,
       published_revision = EXCLUDED.published_revision,
       current_version = EXCLUDED.current_version,
       review_note = EXCLUDED.review_note,
       updated_at = EXCLUDED.updated_at,
       published_at = EXCLUDED.published_at`,
    [
      training.id,
      training.authorId,
      training.status,
      JSON.stringify(training.draft),
      training.revision,
      training.simulatedRevision,
      training.publishedRevision,
      training.currentVersion,
      training.reviewNote,
      training.createdAt,
      training.updatedAt,
      training.publishedAt,
    ],
  );
}

class Conditions {
  readonly clauses: string[] = [];
  readonly params: unknown[] = [];

  add(clause: (placeholder: string) => string, value: unknown): void {
    if (value === undefined || value === null || value === '') {
      return;
    }

    this.params.push(value);
    this.clauses.push(clause(`$${this.params.length}`));
  }

  sql(prefix: string): string {
    return this.clauses.length > 0 ? `${prefix} ${this.clauses.join(' AND ')}` : '';
  }
}

export class TypeOrmTrainingRepository implements TrainingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: string): Promise<Training | null> {
    const [row] = await this.dataSource.query<TrainingRow[]>(
      `SELECT * FROM trainings WHERE id = $1`,
      [id],
    );
    return row ? toTraining(row) : null;
  }

  async save(training: Training): Promise<void> {
    await upsertTraining(this.dataSource.query.bind(this.dataSource), training);
  }

  async publish(training: Training, version: TrainingVersion): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO training_versions (training_id, version, content, published_at, published_by, change_note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          version.trainingId,
          version.version,
          JSON.stringify(version.content),
          version.publishedAt,
          version.publishedBy,
          version.changeNote,
        ],
      );
      await upsertTraining(manager.query.bind(manager), training);
    });
  }

  async studio({ authorId, status }: StudioFilter): Promise<StudioEntry[]> {
    const conditions = new Conditions();
    conditions.add((value) => `training.author_id = ${value}`, authorId);
    conditions.add((value) => `training.status = ${value}`, status);

    const rows = await this.dataSource.query<StudioRow[]>(
      `${STUDIO_SELECT} ${conditions.sql('WHERE')} ORDER BY training.updated_at DESC`,
      conditions.params,
    );
    return rows.map(toStudioEntry);
  }

  async studioEntry(id: string): Promise<StudioEntry | null> {
    const [row] = await this.dataSource.query<StudioRow[]>(
      `${STUDIO_SELECT} WHERE training.id = $1`,
      [id],
    );
    return row ? toStudioEntry(row) : null;
  }

  async catalog(filter: CatalogFilter): Promise<CatalogEntry[]> {
    const conditions = new Conditions();
    conditions.add((value) => `version.content->>'audience' IN (${value}, 'all')`, filter.audience);
    conditions.add((value) => `version.content->>'objective' = ${value}`, filter.objective);
    conditions.add((value) => `version.content->>'difficulty' = ${value}`, filter.difficulty);
    conditions.add(
      (value) => `(version.content->>'estimatedMinutes')::int <= ${value}`,
      filter.maxMinutes,
    );
    conditions.add(
      (value) =>
        `EXISTS (SELECT 1 FROM jsonb_array_elements(version.content->'steps') step
          WHERE step->'config'->'palette' ? ${value})`,
      filter.color,
    );
    conditions.add(
      (value) =>
        `(version.content->>'title' ILIKE '%' || ${value} || '%'
          OR version.content->>'summary' ILIKE '%' || ${value} || '%')`,
      filter.search?.trim(),
    );

    const rows = await this.dataSource.query<CatalogRow[]>(
      `${CATALOG_SELECT} AND version.version = training.current_version ${conditions.sql('AND')}
       ORDER BY version.published_at DESC`,
      conditions.params,
    );
    return rows.map(toCatalogEntry);
  }

  async publishedVersion(id: string, version?: number): Promise<CatalogEntry | null> {
    const [row] = await this.dataSource.query<CatalogRow[]>(
      `${CATALOG_SELECT} AND training.id = $1
         AND version.version = COALESCE($2::int, training.current_version)`,
      [id, version ?? null],
    );
    return row ? toCatalogEntry(row) : null;
  }

  async versionsOf(id: string): Promise<VersionEntry[]> {
    const rows = await this.dataSource.query<VersionRow[]>(
      `SELECT version.version, version.published_at, publisher.name AS published_by_name,
         version.change_note
       FROM training_versions version
       LEFT JOIN users publisher ON publisher.id = version.published_by
       WHERE version.training_id = $1
       ORDER BY version.version DESC`,
      [id],
    );

    return rows.map((row) => ({
      version: row.version,
      publishedAt: row.published_at,
      publishedByName: row.published_by_name ?? 'Conta removida',
      changeNote: row.change_note,
    }));
  }

  async stepBreakdownOf(id: string): Promise<StepBreakdown[]> {
    const rows = await this.dataSource.query<StepRow[]>(
      `SELECT training_version, step_index,
         COUNT(*) AS sessions,
         COUNT(*) FILTER (WHERE cleared) AS cleared_sessions,
         SUM(hits) AS hits,
         SUM(misses) AS misses,
         ROUND(AVG(score)) AS average_score
       FROM training_sessions
       WHERE training_id = $1
       GROUP BY training_version, step_index
       ORDER BY training_version DESC, step_index`,
      [id],
    );

    return rows.map((row) => ({
      version: row.training_version,
      stepIndex: row.step_index,
      sessions: Number(row.sessions),
      clearedSessions: Number(row.cleared_sessions),
      hits: Number(row.hits),
      misses: Number(row.misses),
      averageScore: row.average_score === null ? null : Number(row.average_score),
    }));
  }

  async countByStatus(): Promise<Record<TrainingStatus, number>> {
    const rows = await this.dataSource.query<{ status: TrainingStatus; total: string }[]>(
      `SELECT status, COUNT(*) AS total FROM trainings GROUP BY status`,
    );

    return TRAINING_STATUSES.reduce(
      (counts, status) => ({
        ...counts,
        [status]: Number(rows.find((row) => row.status === status)?.total ?? 0),
      }),
      {} as Record<TrainingStatus, number>,
    );
  }
}
