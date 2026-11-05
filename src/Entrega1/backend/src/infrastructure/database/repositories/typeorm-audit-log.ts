import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import {
  AuditAction,
  AuditEntry,
  AuditEvent,
  AuditFilter,
  AuditLog,
  AuditOutcome,
} from '../../../domain/audit/audit-event';

interface AuditRow {
  id: string;
  at: Date;
  actor_id: string | null;
  actor_name: string | null;
  action: AuditAction;
  outcome: AuditOutcome;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  ip: string | null;
}

export class TypeOrmAuditLog implements AuditLog {
  constructor(private readonly dataSource: DataSource) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO audit_events (id, actor_id, action, outcome, target_type, target_id, details, ip)
       SELECT $1, users.id, $3, $4, $5, $6, $7, $8
       FROM (SELECT $2::uuid AS id) AS candidate
       LEFT JOIN users ON users.id = candidate.id`,
      [
        randomUUID(),
        entry.actorId,
        entry.action,
        entry.outcome,
        entry.targetType,
        entry.targetId,
        JSON.stringify(entry.details),
        entry.ip,
      ],
    );
  }

  async list({ action, actorId, limit, before }: AuditFilter): Promise<AuditEvent[]> {
    const rows = await this.dataSource.query<AuditRow[]>(
      `SELECT event.*, actor.name AS actor_name
       FROM audit_events event
       LEFT JOIN users actor ON actor.id = event.actor_id
       WHERE ($1::text IS NULL OR event.action = $1)
         AND ($2::uuid IS NULL OR event.actor_id = $2)
         AND ($3::timestamptz IS NULL OR event.at < $3)
       ORDER BY event.at DESC
       LIMIT $4`,
      [action ?? null, actorId ?? null, before ?? null, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      at: row.at,
      actorId: row.actor_id,
      actorName: row.actor_name,
      action: row.action,
      outcome: row.outcome,
      targetType: row.target_type,
      targetId: row.target_id,
      details: row.details,
      ip: row.ip,
    }));
  }
}
