import { GAME_MODES } from '../game/game-mode';
import { WALL_TARGET_COUNT } from '../training-session/target-performance';
import { DailyActivity, ModeBreakdown, TargetBreakdown } from './training-statistics';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const PERCENT = 100;

export function accuracyOf(correct: number, attempts: number): number | null {
  return attempts > 0 ? (correct / attempts) * PERCENT : null;
}

export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function activityWindowStart(today: Date, days: number): Date {
  const start = new Date(`${isoDay(today)}T00:00:00.000Z`);
  return new Date(start.getTime() - (days - 1) * ONE_DAY_MS);
}

export function fillActivityWindow(
  recorded: DailyActivity[],
  today: Date,
  days: number,
): DailyActivity[] {
  const byDay = new Map(recorded.map((activity) => [activity.day, activity]));
  const start = activityWindowStart(today, days).getTime();

  return Array.from({ length: days }, (_, index) => {
    const day = isoDay(new Date(start + index * ONE_DAY_MS));
    return byDay.get(day) ?? { day, sessions: 0, score: 0, accuracyPercent: null };
  });
}

export function completeModeBreakdown(recorded: ModeBreakdown[]): ModeBreakdown[] {
  return GAME_MODES.map(
    (mode) =>
      recorded.find((breakdown) => breakdown.mode === mode) ?? {
        mode,
        sessions: 0,
        playTimeMs: 0,
        accuracyPercent: null,
        bestScore: null,
        highestCleared: 0,
      },
  );
}

export function completeTargetBreakdown(recorded: TargetBreakdown[]): TargetBreakdown[] {
  return Array.from(
    { length: WALL_TARGET_COUNT },
    (_, index) =>
      recorded.find((breakdown) => breakdown.targetId === index + 1) ?? {
        targetId: index + 1,
        attempts: 0,
        correctHits: 0,
        accuracyPercent: null,
        impactAverage: null,
        impactPeak: null,
      },
  );
}
