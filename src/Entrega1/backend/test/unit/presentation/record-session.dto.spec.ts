import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RecordSessionDto } from '../../../src/presentation/http/dto/record-session.dto';

const validSession = {
  mode: 'level_color',
  level: 1,
  cleared: true,
  score: 100,
  hits: 5,
  misses: 1,
  bestStreak: 3,
  durationMs: 10_000,
};

async function errorsFor(body: object): Promise<string[]> {
  const errors = await validate(plainToInstance(RecordSessionDto, body), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((error) => error.property);
}

describe('RecordSessionDto telemetry', () => {
  it('keeps accepting the payload older app builds send', async () => {
    await expect(errorsFor(validSession)).resolves.toEqual([]);
  });

  it('accepts a device kind and per-target readings', async () => {
    await expect(
      errorsFor({
        ...validSession,
        deviceKind: 'websocket',
        targets: [
          { targetId: 1, attempts: 3, correctHits: 2, impactAverage: 1200, impactPeak: 4095 },
          { targetId: 9, attempts: 1, correctHits: 1, impactAverage: null, impactPeak: null },
        ],
      }),
    ).resolves.toEqual([]);
  });

  it.each([
    ['an unknown device kind', { deviceKind: 'bluetooth' }],
    ['a target outside 1..9', { targets: [{ targetId: 0, attempts: 1, correctHits: 1 }] }],
    [
      'a repeated target',
      {
        targets: [
          { targetId: 4, attempts: 1, correctHits: 1 },
          { targetId: 4, attempts: 1, correctHits: 0 },
        ],
      },
    ],
    [
      'an impact above the sensor range',
      { targets: [{ targetId: 4, attempts: 1, correctHits: 1, impactPeak: 5000 }] },
    ],
    [
      'more than nine targets',
      {
        targets: Array.from({ length: 10 }, (_, index) => ({
          targetId: (index % 9) + 1,
          attempts: 0,
          correctHits: 0,
        })),
      },
    ],
    ['an unexpected target field', { targets: [{ targetId: 1, attempts: 1, correctHits: 1, x: 1 }] }],
  ])('rejects %s', async (_reason, telemetry) => {
    const errors = await errorsFor({ ...validSession, ...telemetry });
    expect(errors.length).toBeGreaterThan(0);
  });
});
