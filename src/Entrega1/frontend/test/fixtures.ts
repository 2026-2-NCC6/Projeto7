import type { Leaderboard, RankedPlayer } from '../src/services/ranking/types';
import type {
  ActivitySummary,
  PlayerStatistics,
  RecentSession,
  TargetBreakdown,
} from '../src/services/statistics/types';

export function rankedPlayers(count: number, viewerPosition: number | null = null): RankedPlayer[] {
  return Array.from({ length: count }, (_, index) => ({
    position: index + 1,
    name: `Jogador ${index + 1}`,
    value: (count - index) * 150,
    isViewer: index + 1 === viewerPosition,
  }));
}

export function aLeaderboard(overrides: Partial<Leaderboard> = {}): Leaderboard {
  const entries = overrides.entries ?? rankedPlayers(5);
  return {
    category: 'xp',
    total: entries.length,
    entries,
    viewer: null,
    ...overrides,
  };
}

export const EMPTY_SUMMARY: ActivitySummary = {
  sessions: 0,
  playTimeMs: 0,
  hits: 0,
  misses: 0,
  accuracyPercent: null,
  averageResponseMs: null,
  bestResponseMs: null,
  xpEarned: 0,
  totalScore: 0,
  bestScore: null,
  longestHitStreak: 0,
  hardwareSessions: 0,
  firstPlayedAt: null,
  lastPlayedAt: null,
};

export function emptyTargets(): TargetBreakdown[] {
  return Array.from({ length: 9 }, (_, index) => ({
    targetId: index + 1,
    attempts: 0,
    correctHits: 0,
    accuracyPercent: null,
    impactAverage: null,
    impactPeak: null,
  }));
}

export function aRecentSession(index: number, overrides: Partial<RecentSession> = {}): RecentSession {
  return {
    id: `session-${index}`,
    mode: 'level_color',
    level: 3,
    cleared: true,
    score: 1200 + index,
    accuracyPercent: 80,
    durationMs: 45_000,
    deviceKind: 'simulated',
    playedAt: '2026-09-14T18:30:00.000Z',
    ...overrides,
  };
}

function dayOffset(offset: number): string {
  const day = new Date(Date.UTC(2026, 8, 14) - offset * 24 * 60 * 60 * 1000);
  return day.toISOString().slice(0, 10);
}

export function emptyStatistics(): PlayerStatistics {
  return {
    player: { name: 'Ana Souza', level: 0, memberSince: '2026-03-02T12:00:00.000Z' },
    summary: EMPTY_SUMMARY,
    modes: (['level_color', 'level_score', 'infinite_color', 'infinite_score'] as const).map(
      (mode) => ({
        mode,
        sessions: 0,
        playTimeMs: 0,
        accuracyPercent: null,
        bestScore: null,
        highestCleared: 0,
      }),
    ),
    activity: Array.from({ length: 30 }, (_, index) => ({
      day: dayOffset(29 - index),
      sessions: 0,
      score: 0,
      accuracyPercent: null,
    })),
    targets: emptyTargets(),
    recentSessions: [],
    progress: [],
    streak: { current: 0, longest: 0 },
    rank: null,
  };
}

export function fullStatistics(): PlayerStatistics {
  const base = emptyStatistics();
  return {
    ...base,
    player: { ...base.player, level: 7 },
    summary: {
      ...EMPTY_SUMMARY,
      sessions: 42,
      playTimeMs: 2 * 60 * 60 * 1000 + 5 * 60 * 1000,
      hits: 900,
      misses: 100,
      accuracyPercent: 90,
      averageResponseMs: 640,
      bestResponseMs: 210,
      xpEarned: 12_500,
      totalScore: 1_234_567,
      bestScore: 98_765,
      longestHitStreak: 57,
      hardwareSessions: 3,
      firstPlayedAt: '2026-03-02T12:00:00.000Z',
      lastPlayedAt: '2026-09-14T18:30:00.000Z',
    },
    modes: base.modes.map((mode, index) => ({
      ...mode,
      sessions: [20, 10, 8, 4][index],
      bestScore: 5000 * (index + 1),
      highestCleared: index < 2 ? 12 : 0,
      accuracyPercent: 85,
    })),
    activity: base.activity.map((day, index) => ({
      ...day,
      sessions: index % 3,
      score: (index % 3) * 1000,
    })),
    targets: base.targets.map((target) => ({
      ...target,
      attempts: 10 * target.targetId,
      correctHits: 9 * target.targetId,
      accuracyPercent: 90,
      impactAverage: target.targetId === 5 ? 1800 : null,
      impactPeak: target.targetId === 5 ? 3100 : null,
    })),
    recentSessions: Array.from({ length: 10 }, (_, index) => aRecentSession(index)),
    progress: [
      { track: 'color', level: 7, xp: 400, xpRequired: 2250 },
      { track: 'score', level: 4, xp: 100, xpRequired: 1500 },
    ],
    streak: { current: 4, longest: 11 },
    rank: { position: 12, total: 340 },
  };
}
