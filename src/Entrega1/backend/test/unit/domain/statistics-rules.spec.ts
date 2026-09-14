import {
  accuracyOf,
  activityWindowStart,
  completeModeBreakdown,
  completeTargetBreakdown,
  fillActivityWindow,
} from '../../../src/domain/statistics/statistics-rules';

describe('statistics rules', () => {
  const today = new Date('2026-09-14T15:30:00.000Z');

  it('returns null accuracy when nothing was attempted', () => {
    expect(accuracyOf(0, 0)).toBeNull();
    expect(accuracyOf(3, 4)).toBe(75);
  });

  it('starts the window at midnight UTC, including today', () => {
    expect(activityWindowStart(today, 1).toISOString()).toBe('2026-09-14T00:00:00.000Z');
    expect(activityWindowStart(today, 7).toISOString()).toBe('2026-09-08T00:00:00.000Z');
  });

  it('zero-fills every day with no sessions', () => {
    const window = fillActivityWindow([], today, 30);

    expect(window).toHaveLength(30);
    expect(window[0].day).toBe('2026-08-16');
    expect(window[29].day).toBe('2026-09-14');
    expect(window.every((day) => day.sessions === 0 && day.accuracyPercent === null)).toBe(true);
  });

  it('keeps recorded days in place and fills the gaps', () => {
    const window = fillActivityWindow(
      [
        { day: '2026-09-12', sessions: 2, score: 900, accuracyPercent: 80 },
        { day: '2026-09-14', sessions: 1, score: 300, accuracyPercent: 50 },
      ],
      today,
      3,
    );

    expect(window.map((day) => day.sessions)).toEqual([2, 0, 1]);
  });

  it('drops recorded days that fall outside the window', () => {
    const window = fillActivityWindow(
      [{ day: '2026-01-01', sessions: 9, score: 9, accuracyPercent: 9 }],
      today,
      7,
    );

    expect(window.some((day) => day.sessions > 0)).toBe(false);
  });

  it('lists every game mode, even the ones never played', () => {
    const modes = completeModeBreakdown([
      {
        mode: 'infinite_score',
        sessions: 4,
        playTimeMs: 1000,
        accuracyPercent: 90,
        bestScore: 500,
        highestCleared: 0,
      },
    ]);

    expect(modes.map((mode) => mode.mode)).toEqual([
      'level_color',
      'level_score',
      'infinite_color',
      'infinite_score',
    ]);
    expect(modes[3].sessions).toBe(4);
    expect(modes[0]).toMatchObject({ sessions: 0, bestScore: null });
  });

  it('lists all nine wall targets in order', () => {
    const targets = completeTargetBreakdown([
      {
        targetId: 5,
        attempts: 3,
        correctHits: 2,
        accuracyPercent: 66,
        impactAverage: null,
        impactPeak: null,
      },
    ]);

    expect(targets.map((target) => target.targetId)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(targets[4].attempts).toBe(3);
    expect(targets[0].accuracyPercent).toBeNull();
  });
});
