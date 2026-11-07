import { aRecentSession, emptyStatistics, fullStatistics } from '../../../../test/fixtures';
import {
  accuracyTrend,
  activitySeries,
  hasPlayed,
  modeRows,
  recentSessionRows,
  recordItems,
  sessionsIn,
  summaryTiles,
} from './playerMetrics';

describe('summaryTiles', () => {
  it('shows placeholders instead of fake numbers for a new player', () => {
    const tiles = summaryTiles(emptyStatistics().summary);

    expect(tiles.map((tile) => tile.value)).toEqual(['—', '0s', '0', '—']);
  });

  it('keeps large totals short enough for a tile', () => {
    const summary = { ...fullStatistics().summary, sessions: 123_456 };

    expect(summaryTiles(summary).map((tile) => tile.value)).toEqual([
      '90%',
      '2h 05min',
      '123,5K',
      '640 ms',
    ]);
  });
});

describe('recordItems', () => {
  it('formats records, streaks and ranking', () => {
    const items = Object.fromEntries(
      recordItems(fullStatistics()).map((item) => [item.key, item.value]),
    );

    expect(items).toMatchObject({
      bestScore: '98.765',
      totalScore: '1.234.567',
      hitsAndMisses: '900 / 100',
      dailyStreak: '4 dias',
      rank: '#12 de 340',
    });
  });

  it('never invents a rank or a best score', () => {
    const items = Object.fromEntries(
      recordItems(emptyStatistics()).map((item) => [item.key, item.value]),
    );

    expect(items.rank).toBe('—');
    expect(items.bestScore).toBe('—');
    expect(items.lastSession).toBe('—');
  });
});

describe('activitySeries', () => {
  it('slices the requested window from the end', () => {
    const activity = fullStatistics().activity;

    expect(activitySeries(activity, 7)).toHaveLength(7);
    expect(activitySeries(activity, 30)).toHaveLength(30);
    expect(activitySeries(activity, 7)[6].label).toBe('14/09');
  });

  it('works when the server sent fewer days than the window', () => {
    const series = activitySeries(fullStatistics().activity.slice(-2), 30);

    expect(series).toHaveLength(2);
    expect(sessionsIn(series)).toBe(series[0].value + series[1].value);
  });
});

describe('accuracyTrend', () => {
  it('orders sessions oldest first and keeps gaps', () => {
    const sessions = [
      aRecentSession(1, { accuracyPercent: 90 }),
      aRecentSession(2, { accuracyPercent: null }),
      aRecentSession(3, { accuracyPercent: 40 }),
    ];

    expect(accuracyTrend(sessions)).toEqual([40, null, 90]);
    expect(accuracyTrend([])).toEqual([]);
  });
});

describe('modeRows', () => {
  it('computes each mode share and shows level or record by mode type', () => {
    const rows = modeRows(fullStatistics().modes);

    expect(rows.map((row) => Math.round(row.sharePercent))).toEqual([48, 24, 19, 10]);
    expect(rows[0].detail).toBe('Nível 12');
    expect(rows[3].detail).toBe('Recorde 20.000');
  });

  it('does not divide by zero when nothing was played', () => {
    expect(modeRows(emptyStatistics().modes).every((row) => row.sharePercent === 0)).toBe(true);
  });
});

describe('recentSessionRows', () => {
  it('labels modes and handles sessions with no attempts', () => {
    const [row] = recentSessionRows([
      aRecentSession(1, { mode: 'infinite_score', score: 45_210, accuracyPercent: null }),
    ]);

    expect(row).toMatchObject({ mode: 'Infinite Score', score: '45.210', accuracy: '—' });
  });
});

describe('hasPlayed', () => {
  it('is true only once a session exists', () => {
    expect(hasPlayed(emptyStatistics())).toBe(false);
    expect(hasPlayed(fullStatistics())).toBe(true);
  });
});
