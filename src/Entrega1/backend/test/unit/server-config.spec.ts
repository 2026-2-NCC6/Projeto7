import { buildServerConfig } from '../../src/server-config';

const readFile = (path: string) => Buffer.from(`conteúdo de ${path}`);

describe('buildServerConfig', () => {
  it('listens on loopback with CORS and TLS off by default', () => {
    expect(buildServerConfig({}, readFile)).toEqual({
      host: '127.0.0.1',
      port: 3000,
      corsOrigins: [],
      https: null,
      trustProxy: false,
    });
  });

  it('reads the allowed origins as a comma-separated list', () => {
    const config = buildServerConfig(
      { CORS_ORIGINS: 'https://painel.smash.app, http://localhost:5173 ,' },
      readFile,
    );

    expect(config.corsOrigins).toEqual(['https://painel.smash.app', 'http://localhost:5173']);
  });

  it('loads the certificate when both TLS paths are given', () => {
    const config = buildServerConfig(
      { TLS_KEY_PATH: 'key.pem', TLS_CERT_PATH: 'cert.pem' },
      readFile,
    );

    expect(config.https?.key.toString()).toBe('conteúdo de key.pem');
    expect(config.https?.cert.toString()).toBe('conteúdo de cert.pem');
  });

  it('refuses half a TLS configuration instead of silently serving HTTP', () => {
    expect(() => buildServerConfig({ TLS_KEY_PATH: 'key.pem' }, readFile)).toThrow(/juntos/);
  });
});
