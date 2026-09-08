import { GameMode, ProgressionTrack } from '../game/game-mode';

interface BaseCriterion {
  target: number;
  comparison?: 'atMost';
}

export type AchievementCriterion =
  | (BaseCriterion & {
      metric:
        | 'sessionsTotal'
        | 'scoreTotal'
        | 'hitStreakBest'
        | 'accuracyBest'
        | 'xpTotal'
        | 'dailyStreakCurrent'
        | 'dailyStreakLongest'
        | 'leaderboardPosition';
    })
  | (BaseCriterion & { metric: 'sessionsInMode'; mode: GameMode })
  | (BaseCriterion & { metric: 'levelReached'; track?: ProgressionTrack });
