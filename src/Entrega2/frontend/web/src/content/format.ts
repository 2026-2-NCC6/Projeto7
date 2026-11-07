const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const dateOnly = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const integer = new Intl.NumberFormat('pt-BR');
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatDateTime(value: string | null): string {
  return value ? dateTime.format(new Date(value)) : '—';
}

export function formatDay(day: string): string {
  return dateOnly.format(new Date(`${day}T12:00:00`));
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : integer.format(Math.round(value));
}

export function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `${Math.round(value)}%`;
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) {
    return '—';
  }

  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  }

  return minutes > 0 ? `${minutes}min ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
}

export function formatMs(ms: number | null | undefined): string {
  return ms === null || ms === undefined ? '—' : `${integer.format(Math.round(ms))} ms`;
}

export function formatPrice(cents: number | null): string {
  return cents === null ? '—' : money.format(cents / 100);
}

export function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}
