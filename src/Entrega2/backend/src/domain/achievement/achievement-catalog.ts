import { AchievementDefinition } from './achievement';

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    id: 'first_session',
    category: 'sessions',
    tier: 'bronze',
    criterion: { metric: 'sessionsTotal', target: 1 },
  },
  {
    id: 'sessions_25',
    category: 'sessions',
    tier: 'silver',
    criterion: { metric: 'sessionsTotal', target: 25 },
  },
  {
    id: 'sessions_100',
    category: 'sessions',
    tier: 'gold',
    criterion: { metric: 'sessionsTotal', target: 100 },
  },

  {
    id: 'level_10',
    category: 'level',
    tier: 'bronze',
    criterion: { metric: 'levelReached', target: 10 },
  },
  {
    id: 'level_25',
    category: 'level',
    tier: 'silver',
    criterion: { metric: 'levelReached', target: 25 },
  },
  {
    id: 'level_50',
    category: 'level',
    tier: 'gold',
    criterion: { metric: 'levelReached', target: 50 },
  },
  {
    id: 'level_color_20',
    category: 'level',
    tier: 'silver',
    criterion: { metric: 'levelReached', track: 'color', target: 20 },
  },
  {
    id: 'level_score_20',
    category: 'level',
    tier: 'silver',
    criterion: { metric: 'levelReached', track: 'score', target: 20 },
  },

  {
    id: 'xp_10k',
    category: 'xp',
    tier: 'silver',
    criterion: { metric: 'xpTotal', target: 10000 },
  },
  {
    id: 'xp_50k',
    category: 'xp',
    tier: 'gold',
    criterion: { metric: 'xpTotal', target: 50000 },
  },

  {
    id: 'streak_7',
    category: 'dailyStreak',
    tier: 'bronze',
    criterion: { metric: 'dailyStreakCurrent', target: 7 },
  },
  {
    id: 'streak_30',
    category: 'dailyStreak',
    tier: 'silver',
    criterion: { metric: 'dailyStreakCurrent', target: 30 },
  },
  {
    id: 'streak_100',
    category: 'dailyStreak',
    tier: 'legend',
    criterion: { metric: 'dailyStreakLongest', target: 100 },
  },

  {
    id: 'score_10k',
    category: 'score',
    tier: 'bronze',
    criterion: { metric: 'scoreTotal', target: 10000 },
  },
  {
    id: 'score_100k',
    category: 'score',
    tier: 'gold',
    criterion: { metric: 'scoreTotal', target: 100000 },
  },

  {
    id: 'accuracy_80',
    category: 'accuracy',
    tier: 'bronze',
    criterion: { metric: 'accuracyBest', target: 80 },
  },
  {
    id: 'accuracy_90',
    category: 'accuracy',
    tier: 'silver',
    criterion: { metric: 'accuracyBest', target: 90 },
  },
  {
    id: 'accuracy_95',
    category: 'accuracy',
    tier: 'gold',
    criterion: { metric: 'accuracyBest', target: 95 },
  },

  {
    id: 'hit_streak_25',
    category: 'hitStreak',
    tier: 'bronze',
    criterion: { metric: 'hitStreakBest', target: 25 },
  },
  {
    id: 'hit_streak_50',
    category: 'hitStreak',
    tier: 'silver',
    criterion: { metric: 'hitStreakBest', target: 50 },
  },
  {
    id: 'hit_streak_100',
    category: 'hitStreak',
    tier: 'legend',
    criterion: { metric: 'hitStreakBest', target: 100 },
  },

  {
    id: 'mode_level_color_10',
    category: 'mode',
    tier: 'silver',
    criterion: { metric: 'sessionsInMode', mode: 'level_color', target: 10 },
  },
  {
    id: 'mode_level_score_10',
    category: 'mode',
    tier: 'silver',
    criterion: { metric: 'sessionsInMode', mode: 'level_score', target: 10 },
  },
  {
    id: 'mode_infinite_color_10',
    category: 'mode',
    tier: 'silver',
    criterion: { metric: 'sessionsInMode', mode: 'infinite_color', target: 10 },
  },
  {
    id: 'mode_infinite_score_10',
    category: 'mode',
    tier: 'silver',
    criterion: { metric: 'sessionsInMode', mode: 'infinite_score', target: 10 },
  },

  {
    id: 'rank_top_100',
    category: 'rank',
    tier: 'bronze',
    criterion: { metric: 'leaderboardPosition', comparison: 'atMost', target: 100 },
  },
  {
    id: 'rank_top_10',
    category: 'rank',
    tier: 'silver',
    criterion: { metric: 'leaderboardPosition', comparison: 'atMost', target: 10 },
  },
  {
    id: 'rank_first',
    category: 'rank',
    tier: 'legend',
    criterion: { metric: 'leaderboardPosition', comparison: 'atMost', target: 1 },
  },
];
