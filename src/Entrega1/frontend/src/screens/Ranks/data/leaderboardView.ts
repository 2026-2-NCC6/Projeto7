import type { Leaderboard, RankedPlayer, RankingCategory } from '../../../services/ranking/types';

export const PODIUM_SIZE = 3;

export interface LeaderboardLayout {
  podium: RankedPlayer[];
  rows: RankedPlayer[];
  pinnedViewer: RankedPlayer | null;
}

export type LeaderboardStatus =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'empty'; board: Leaderboard }
  | { kind: 'ready'; board: Leaderboard; layout: LeaderboardLayout };

export type ViewerStanding = 'guest' | 'unranked' | 'listed' | 'pinned';

export interface LeaderboardResource {
  data: Leaderboard | null;
  error: string | null;
}

export function layoutLeaderboard({ entries, viewer }: Leaderboard): LeaderboardLayout {
  const viewerListed = entries.some((entry) => entry.isViewer);

  return {
    podium: entries.slice(0, PODIUM_SIZE),
    rows: entries.slice(PODIUM_SIZE),
    pinnedViewer: viewer && !viewerListed ? viewer : null,
  };
}

export function leaderboardStatusOf(
  category: RankingCategory,
  { data, error }: LeaderboardResource,
): LeaderboardStatus {
  const board = data?.category === category ? data : null;

  if (error) {
    return { kind: 'error', message: error };
  }
  if (!board) {
    return { kind: 'loading' };
  }
  if (board.entries.length === 0) {
    return { kind: 'empty', board };
  }
  return { kind: 'ready', board, layout: layoutLeaderboard(board) };
}

export function viewerStandingOf(board: Leaderboard, isGuest: boolean): ViewerStanding {
  if (isGuest) {
    return 'guest';
  }
  if (!board.viewer) {
    return 'unranked';
  }
  return board.entries.some((entry) => entry.isViewer) ? 'listed' : 'pinned';
}

export function podiumOrder(podium: readonly RankedPlayer[]): RankedPlayer[] {
  const [first, second, third] = podium;
  return [second, first, third].filter((player): player is RankedPlayer => Boolean(player));
}
