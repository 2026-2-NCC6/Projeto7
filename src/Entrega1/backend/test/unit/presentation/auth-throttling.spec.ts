import { AUTH_THROTTLING } from '../../../src/presentation/http/auth-throttling';

const throttlers = Array.isArray(AUTH_THROTTLING) ? AUTH_THROTTLING : AUTH_THROTTLING.throttlers;
const byEmail = throttlers.find((throttler) => throttler.name === 'email');

function trackerFor(request: Record<string, unknown>): Promise<string | undefined> {
  return Promise.resolve(byEmail?.getTracker?.(request, {} as never));
}

describe('auth throttling', () => {
  it('counts attempts per account, whatever the casing or spacing of the e-mail', async () => {
    await expect(
      trackerFor({ ip: '10.0.0.1', body: { email: ' Ana@Smash.test ' } }),
    ).resolves.toBe('ana@smash.test');
  });

  it('falls back to the address when the request carries no e-mail', async () => {
    await expect(trackerFor({ ip: '10.0.0.1', body: {} })).resolves.toBe('10.0.0.1');
  });

  it('blocks for longer than the window an attempt is counted in', () => {
    throttlers.forEach((throttler) =>
      expect(Number(throttler.blockDuration)).toBeGreaterThanOrEqual(Number(throttler.ttl)),
    );
  });
});
