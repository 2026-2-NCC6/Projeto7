export const AUDIT_ACTIONS = [
  'auth.sign_in',
  'auth.sign_up',
  'auth.sign_out',
  'request.refused',
  'request.failed',
  'user.role_changed',
  'user.profile_updated',
  'training.created',
  'training.updated',
  'training.simulated',
  'training.submitted',
  'training.published',
  'training.returned',
  'training.archived',
  'training.restored',
  'session.emergency_stop',
  'session.offline_synced',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditOutcome = 'success' | 'failure';

export interface AuditEntry {
  action: AuditAction;
  outcome: AuditOutcome;
  actorId: string | null;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown>;
  ip: string | null;
}

export interface AuditEvent extends AuditEntry {
  id: string;
  actorName: string | null;
  at: Date;
}

export interface AuditFilter {
  action?: AuditAction;
  actorId?: string;
  limit: number;
  before?: Date;
}

export interface AuditLog {
  record(entry: AuditEntry): Promise<void>;
  list(filter: AuditFilter): Promise<AuditEvent[]>;
}

export const AUDIT_LOG = Symbol('AuditLog');

export function auditEntry(
  action: AuditAction,
  actorId: string | null,
  target: { type: string; id: string } | null = null,
  details: Record<string, unknown> = {},
): AuditEntry {
  return {
    action,
    outcome: 'success',
    actorId,
    targetType: target?.type ?? null,
    targetId: target?.id ?? null,
    details,
    ip: null,
  };
}

export const AUDIT_LOG_NONE: AuditLog = {
  record: async () => undefined,
  list: async () => [],
};
