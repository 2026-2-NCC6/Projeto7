import { emptyTargets, fullStatistics } from '../../../../test/fixtures';
import { colorAccuracy, hasTargetData, impactRows, wallCells } from './wallMetrics';

describe('wallCells', () => {
  it('maps every wall target with its share of hits', () => {
    const cells = wallCells(fullStatistics().targets);

    expect(cells).toHaveLength(9);
    expect(cells[8]).toMatchObject({ intensity: 1, label: '20%' });
    expect(cells[0].intensity).toBeCloseTo(1 / 9);
  });

  it('stays blank and safe without data', () => {
    const cells = wallCells(emptyTargets());

    expect(cells.every((cell) => cell.intensity === 0 && cell.label === '0%')).toBe(true);
  });

  it('tolerates a partial target list', () => {
    const cells = wallCells([
      {
        targetId: 3,
        attempts: 4,
        correctHits: 4,
        accuracyPercent: 100,
        impactAverage: null,
        impactPeak: null,
      },
    ]);

    expect(cells.find((cell) => cell.target.id === 3)?.label).toBe('100%');
  });
});

describe('colorAccuracy', () => {
  it('folds the three targets of each colour', () => {
    const targets = emptyTargets().map((target) =>
      target.targetId === 1 ? { ...target, attempts: 4, correctHits: 3 } : target,
    );

    const byColor = Object.fromEntries(
      colorAccuracy(targets).map((entry) => [entry.color, entry.valueLabel]),
    );

    expect(byColor).toEqual({ amber: '75%', blue: '—', red: '—' });
  });
});

describe('impactRows', () => {
  it('lists only targets with real sensor readings', () => {
    const rows = impactRows(fullStatistics().targets);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ label: 'Alvo 5', valueLabel: 'Média 1.800 · Pico 3.100' });
    expect(rows[0].averagePercent).toBeCloseTo((1800 / 4095) * 100);
  });

  it('is empty for simulated play', () => {
    expect(impactRows(emptyTargets())).toEqual([]);
    expect(hasTargetData(emptyTargets())).toBe(false);
  });
});
