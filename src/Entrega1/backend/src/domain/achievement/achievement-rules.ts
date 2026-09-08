import { totalXpUpToLevel } from '../progression/level-rules';
import { highestLevelOf, Progression } from '../progression/progression.entity';
import { AchievementDefinition, AchievementStatus } from './achievement';
import { ACHIEVEMENT_CATALOG } from './achievement-catalog';
import { AchievementCriterion } from './achievement-criteria';
import { PlayerSnapshot } from './player-snapshot';

const PERCENT = 100;

function accumulatedXp(progressions: Progression[]): number {
  return progressions.reduce(
    (total, progression) => total + totalXpUpToLevel(progression.level) + progression.xp,
    0,
  );
}

function measure(snapshot: PlayerSnapshot, criterion: AchievementCriterion): number | null {
  switch (criterion.metric) {
    case 'sessionsTotal':
      return snapshot.sessionStats.totalSessions;
    case 'scoreTotal':
      return snapshot.sessionStats.totalScore;
    case 'hitStreakBest':
      return snapshot.sessionStats.bestStreak;
    case 'accuracyBest':
      return snapshot.sessionInsights.accuracyPercent;
    case 'xpTotal':
      return accumulatedXp(snapshot.progressions);
    case 'dailyStreakCurrent':
      return snapshot.dailyStreak.currentStreak;
    case 'dailyStreakLongest':
      return snapshot.dailyStreak.longestStreak;
    case 'leaderboardPosition':
      return snapshot.leaderboardPosition;
    case 'sessionsInMode':
      return snapshot.sessionInsights.sessionsByMode[criterion.mode];
    case 'levelReached':
      return highestLevelOf(snapshot.progressions, criterion.track);
  }
}

function statusOf(definition: AchievementDefinition, snapshot: PlayerSnapshot): AchievementStatus {
  const { id, category, tier, criterion } = definition;
  const { target } = criterion;
  const current = measure(snapshot, criterion);

  if (current === null) {
    return { id, category, tier, target, current: null, progress: null, unlocked: false };
  }

  if (criterion.comparison === 'atMost') {
    const unlocked = current <= target;
    return { id, category, tier, target, current, progress: unlocked ? PERCENT : null, unlocked };
  }

  return {
    id,
    category,
    tier,
    target,
    current,
    progress: Math.min(PERCENT, Math.round((current / target) * PERCENT)),
    unlocked: current >= target,
  };
}

export function evaluateAchievements(snapshot: PlayerSnapshot): AchievementStatus[] {
  return ACHIEVEMENT_CATALOG.map((definition) => statusOf(definition, snapshot));
}
