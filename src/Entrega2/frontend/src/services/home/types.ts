import type { GameModeId, ProgressionTrack } from '../../types/game';

export interface TrackProgress {
  track: ProgressionTrack;
  level: number;
  xp: number;
  xpRequired: number;
}

export interface DailyChallengeStatus {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

export interface SessionStats {
  totalSessions: number;
  bestStreak: number;
  totalScore: number;
}

export interface HomeOverview {
  player: { name: string };
  dailyChallenge: DailyChallengeStatus;
  progress: TrackProgress[];
  stats: SessionStats;
  highestClearedByMode: Record<GameModeId, number>;
}

export const GUEST_OVERVIEW: HomeOverview = {
  player: { name: 'Visitante' },
  dailyChallenge: { currentStreak: 0, longestStreak: 0, completedToday: false },
  progress: [
    { track: 'color', level: 0, xp: 0, xpRequired: 500 },
    { track: 'score', level: 0, xp: 0, xpRequired: 500 },
  ],
  stats: { totalSessions: 0, bestStreak: 0, totalScore: 0 },
  highestClearedByMode: {
    level_color: 0,
    level_score: 0,
    infinite_color: 0,
    infinite_score: 0,
  },
};
