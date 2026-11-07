import { resolveApiBaseUrl } from './env';

const development = { configured: undefined, lanHost: null, platform: 'android', isDevelopment: true } as const;

describe('resolveApiBaseUrl', () => {
  it('lets a development build reach the machine running Metro over HTTP', () => {
    expect(resolveApiBaseUrl({ ...development, lanHost: '192.168.0.10' })).toBe(
      'http://192.168.0.10:3000',
    );
    expect(resolveApiBaseUrl(development)).toBe('http://10.0.2.2:3000');
  });

  it('uses the configured address as is in development', () => {
    expect(resolveApiBaseUrl({ ...development, configured: 'http://127.0.0.1:3000' })).toBe(
      'http://127.0.0.1:3000',
    );
  });

  it('accepts an HTTPS API in any other build', () => {
    expect(
      resolveApiBaseUrl({ ...development, isDevelopment: false, configured: 'https://api.smash.app' }),
    ).toBe('https://api.smash.app');
  });

  it.each([
    ['a plain HTTP address', 'http://api.smash.app'],
    ['no address at all', undefined],
  ])('refuses to ship a build with %s', (_case, configured) => {
    expect(() =>
      resolveApiBaseUrl({ ...development, isDevelopment: false, configured, lanHost: '10.0.0.2' }),
    ).toThrow('https://');
  });
});
