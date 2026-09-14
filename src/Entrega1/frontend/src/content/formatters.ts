const LOCALE = 'pt-BR';
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const THOUSAND = 1_000;
const MILLION = 1_000_000;

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString(LOCALE);
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= MILLION) {
    return `${(value / MILLION).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}M`;
  }
  if (Math.abs(value) >= THOUSAND * 10) {
    return `${(value / THOUSAND).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}K`;
  }
  return formatNumber(value);
}

export function formatPercent(percent: number): string {
  return `${Math.round(percent)}%`;
}

export function formatResponseTime(milliseconds: number): string {
  return milliseconds < MS_PER_SECOND
    ? `${Math.round(milliseconds)} ms`
    : `${(milliseconds / MS_PER_SECOND).toLocaleString(LOCALE, { maximumFractionDigits: 2 })} s`;
}

export function formatPlayTime(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / MS_PER_SECOND / SECONDS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (hours > 0) {
    return `${formatNumber(hours)}h ${String(minutes).padStart(2, '0')}min`;
  }
  if (totalMinutes > 0) {
    return `${minutes}min`;
  }
  return `${Math.round(milliseconds / MS_PER_SECOND)}s`;
}

export function formatClock(milliseconds: number): string {
  const totalSeconds = Math.round(milliseconds / MS_PER_SECOND);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = String(totalSeconds % SECONDS_PER_MINUTE).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function formatShortDateTime(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' });
  const time = date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
  return `${day} ${time}`;
}

export function formatDayMonth(isoDay: string): string {
  const [, month, day] = isoDay.split('-');
  return `${day}/${month}`;
}

export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}

export function formatTimeOfDay(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
