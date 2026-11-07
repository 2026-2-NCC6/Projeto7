import {
  formatClock,
  formatCompact,
  formatDayMonth,
  formatNumber,
  formatPercent,
  formatPlayTime,
  formatResponseTime,
} from './formatters';

describe('formatters', () => {
  it('groups thousands the Brazilian way', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
    expect(formatNumber(0)).toBe('0');
  });

  it('compacts only numbers that would crowd a tile', () => {
    expect(formatCompact(9_999)).toBe('9.999');
    expect(formatCompact(12_500)).toBe('12,5K');
    expect(formatCompact(3_400_000)).toBe('3,4M');
  });

  it('rounds percentages', () => {
    expect(formatPercent(89.6)).toBe('90%');
  });

  it('switches response times from milliseconds to seconds', () => {
    expect(formatResponseTime(640)).toBe('640 ms');
    expect(formatResponseTime(1250)).toBe('1,25 s');
  });

  it('formats play time for seconds, minutes and hours', () => {
    expect(formatPlayTime(0)).toBe('0s');
    expect(formatPlayTime(42_000)).toBe('42s');
    expect(formatPlayTime(9 * 60_000)).toBe('9min');
    expect(formatPlayTime(125 * 60_000)).toBe('2h 05min');
    expect(formatPlayTime(1000 * 60 * 60_000)).toBe('1.000h 00min');
  });

  it('formats a clock and a day label', () => {
    expect(formatClock(3_725_000)).toBe('62:05');
    expect(formatDayMonth('2026-09-04')).toBe('04/09');
  });
});
