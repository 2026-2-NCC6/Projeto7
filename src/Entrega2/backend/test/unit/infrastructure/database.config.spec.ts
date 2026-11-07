import { buildDataSourceOptions } from '../../../src/infrastructure/database/database.config';

describe('buildDataSourceOptions', () => {
  it('uses the credentials it is given', () => {
    const options = buildDataSourceOptions({ DB_USER: 'smash', DB_PASSWORD: 's3nha' });

    expect(options).toMatchObject({ username: 'smash', password: 's3nha' });
  });

  it.each(['DB_USER', 'DB_PASSWORD'])('refuses to start without %s', (name) => {
    const env: NodeJS.ProcessEnv = { DB_USER: 'smash', DB_PASSWORD: 's3nha' };
    delete env[name];

    expect(() => buildDataSourceOptions(env)).toThrow(name);
  });
});
