import type { BarDatum } from '../../../components/charts/BarChart';
import { gameModeIcons, gameModeLabels } from '../../../content/gameLabels';
import {
  formatCompact,
  formatDayMonth,
  formatNumber,
  formatPercent,
  formatPlayTime,
  formatResponseTime,
  formatShortDateTime,
} from '../../../content/formatters';
import { texts } from '../../../content/texts';
import type { IconName } from '../../../components/Icon';
import { hasLevels } from '../../../gameplay/modes/mode-catalog';
import type {
  ActivitySummary,
  DailyActivity,
  ModeBreakdown,
  PlayerStatistics,
  RecentSession,
} from '../../../services/statistics/types';
import type { GameModeId } from '../../../types/game';
import type { DataItem } from './dataItem';

const PERCENT = 100;

export const ACTIVITY_WINDOWS = [7, 30] as const;

export type ActivityWindow = (typeof ACTIVITY_WINDOWS)[number];

export interface StatTile {
  key: string;
  label: string;
  value: string;
}

export interface ModeRow {
  mode: GameModeId;
  label: string;
  icon: IconName;
  sharePercent: number;
  summary: string;
  detail: string;
}

export interface RecentSessionRow {
  id: string;
  mode: string;
  playedAt: string;
  score: string;
  accuracy: string;
}

function orEmpty<TValue>(value: TValue | null, format: (value: TValue) => string): string {
  return value === null ? texts.stats.empty : format(value);
}

export function hasPlayed(statistics: PlayerStatistics): boolean {
  return statistics.summary.sessions > 0;
}

export function summaryTiles(summary: ActivitySummary): StatTile[] {
  return [
    {
      key: 'accuracy',
      label: texts.stats.summary.accuracy,
      value: orEmpty(summary.accuracyPercent, formatPercent),
    },
    {
      key: 'playTime',
      label: texts.stats.summary.playTime,
      value: formatPlayTime(summary.playTimeMs),
    },
    {
      key: 'sessions',
      label: texts.stats.summary.sessions,
      value: formatCompact(summary.sessions),
    },
    {
      key: 'averageResponse',
      label: texts.stats.summary.averageResponse,
      value: orEmpty(summary.averageResponseMs, formatResponseTime),
    },
  ];
}

export function recordItems({ summary, streak, rank }: PlayerStatistics): DataItem[] {
  return [
    { key: 'bestScore', label: texts.stats.bestScore, value: orEmpty(summary.bestScore, formatNumber) },
    { key: 'totalScore', label: texts.stats.totalScore, value: formatNumber(summary.totalScore) },
    { key: 'xpEarned', label: texts.stats.xpEarned, value: formatNumber(summary.xpEarned) },
    {
      key: 'hitsAndMisses',
      label: texts.stats.hitsAndMisses,
      value: texts.stats.hitsAndMissesValue(formatNumber(summary.hits), formatNumber(summary.misses)),
    },
    {
      key: 'longestHitStreak',
      label: texts.stats.longestHitStreak,
      value: formatNumber(summary.longestHitStreak),
    },
    {
      key: 'bestResponse',
      label: texts.stats.bestResponse,
      value: orEmpty(summary.bestResponseMs, formatResponseTime),
    },
    { key: 'dailyStreak', label: texts.stats.dailyStreak, value: texts.stats.daysValue(streak.current) },
    {
      key: 'longestDailyStreak',
      label: texts.stats.longestDailyStreak,
      value: texts.stats.daysValue(streak.longest),
    },
    {
      key: 'rank',
      label: texts.stats.rank,
      value: rank ? texts.stats.rankValue(rank.position, rank.total) : texts.stats.empty,
    },
    {
      key: 'hardwareSessions',
      label: texts.stats.hardwareSessions,
      value: formatNumber(summary.hardwareSessions),
    },
    {
      key: 'lastSession',
      label: texts.stats.lastSession,
      value: orEmpty(summary.lastPlayedAt, formatShortDateTime),
    },
  ];
}

export function activitySeries(activity: readonly DailyActivity[], window: ActivityWindow): BarDatum[] {
  return activity.slice(-window).map((day) => ({
    key: day.day,
    label: formatDayMonth(day.day),
    value: day.sessions,
  }));
}

export function sessionsIn(series: readonly BarDatum[]): number {
  return series.reduce((total, day) => total + day.value, 0);
}

export function accuracyTrend(recentSessions: readonly RecentSession[]): (number | null)[] {
  return [...recentSessions].reverse().map((session) => session.accuracyPercent);
}

export function modeRows(modes: readonly ModeBreakdown[]): ModeRow[] {
  const totalSessions = modes.reduce((total, mode) => total + mode.sessions, 0);

  return modes.map((breakdown) => {
    const sharePercent = totalSessions > 0 ? (breakdown.sessions / totalSessions) * PERCENT : 0;

    return {
      mode: breakdown.mode,
      label: gameModeLabels[breakdown.mode],
      icon: gameModeIcons[breakdown.mode],
      sharePercent,
      summary: texts.stats.modeSummary(breakdown.sessions, formatPercent(sharePercent)),
      detail: hasLevels(breakdown.mode)
        ? texts.stats.modeLevel(breakdown.highestCleared)
        : texts.stats.modeBest(orEmpty(breakdown.bestScore, formatNumber)),
    };
  });
}

export function recentSessionRows(recentSessions: readonly RecentSession[]): RecentSessionRow[] {
  return recentSessions.map((session) => ({
    id: session.id,
    mode: gameModeLabels[session.mode],
    playedAt: formatShortDateTime(session.playedAt),
    score: formatNumber(session.score),
    accuracy: orEmpty(session.accuracyPercent, formatPercent),
  }));
}
