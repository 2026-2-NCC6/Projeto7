import { readFileSync } from 'node:fs';

export interface ServerConfig {
  host: string;
  port: number;
  /** Browser origins allowed by CORS. Empty disables CORS: the mobile app sends no Origin. */
  corsOrigins: string[];
  https: { key: Buffer; cert: Buffer } | null;
}

function listOf(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * How the API is exposed. Every default is the closed one: loopback only, no
 * CORS, and plain HTTP only when no certificate was given.
 */
export function buildServerConfig(
  env: NodeJS.ProcessEnv = process.env,
  readFile: (path: string) => Buffer = readFileSync,
): ServerConfig {
  const keyPath = env.TLS_KEY_PATH;
  const certPath = env.TLS_CERT_PATH;

  if (Boolean(keyPath) !== Boolean(certPath)) {
    throw new Error('TLS_KEY_PATH e TLS_CERT_PATH precisam ser definidos juntos.');
  }

  return {
    host: env.HOST ?? '127.0.0.1',
    port: Number(env.PORT ?? 3000),
    corsOrigins: listOf(env.CORS_ORIGINS),
    https: keyPath && certPath ? { key: readFile(keyPath), cert: readFile(certPath) } : null,
  };
}
