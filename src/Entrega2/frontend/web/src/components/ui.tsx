import type { ReactNode } from 'react';
import type { TargetColor, TrainingStatus } from '../api/types';
import { colorLabels, statusLabels } from '../content/labels';
import type { Resource } from '../hooks/useResource';

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="row" role="status">
      <div className="spinner" aria-hidden="true" />
      <span className="muted">{label}…</span>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty stack-sm">
      <strong>{title}</strong>
      {children ? <div className="small">{children}</div> : null}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="alert alert-danger row-between" role="alert">
      <span>{message}</span>
      {onRetry ? (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Tentar de novo
        </button>
      ) : null}
    </div>
  );
}

export function Loaded<T>({
  resource,
  children,
}: {
  resource: Resource<T>;
  children: (data: T) => ReactNode;
}) {
  if (resource.error) {
    return <ErrorMessage message={resource.error} onRetry={resource.reload} />;
  }

  if (resource.data === null) {
    return <Spinner />;
  }

  return <>{children(resource.data)}</>;
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="card-flat stat">
      <span className="eyebrow">{label}</span>
      <span className="stat-value">{value}</span>
      {hint ? <span className="small muted">{hint}</span> : null}
    </div>
  );
}

const STATUS_TONE: Record<TrainingStatus, string> = {
  draft: 'badge',
  in_review: 'badge badge-warning',
  published: 'badge badge-accent',
  archived: 'badge',
};

export function StatusBadge({ status }: { status: TrainingStatus }) {
  return <span className={STATUS_TONE[status]}>{statusLabels[status]}</span>;
}

export function ColorDots({ colors }: { colors: readonly TargetColor[] }) {
  return (
    <span className="row" style={{ gap: 6 }}>
      {colors.map((color) => (
        <span key={color} className={`color-dot ${color}`} title={colorLabels[color]} aria-label={colorLabels[color]} />
      ))}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="stack-sm">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      {actions ? <div className="row">{actions}</div> : null}
    </header>
  );
}

export function Section({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card stack">
      <div className="row-between">
        <h2>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
