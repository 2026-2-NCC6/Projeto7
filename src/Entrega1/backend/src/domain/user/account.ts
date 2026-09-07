import { DailyStreak } from '../daily-streak/daily-streak.entity';
import { PROGRESSION_TRACKS } from '../game/game-mode';
import { Progression } from '../progression/progression.entity';
import { User } from './user.entity';

export interface Account {
  user: User;
  progressions: Progression[];
  dailyStreak: DailyStreak;
}

export function openAccountFor(user: User): Account {
  return {
    user,
    progressions: PROGRESSION_TRACKS.map((track) => Progression.start(user.id, track)),
    dailyStreak: DailyStreak.start(user.id),
  };
}
