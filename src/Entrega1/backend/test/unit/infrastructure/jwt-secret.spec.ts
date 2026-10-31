import { randomBytes } from 'node:crypto';

import { requireStrongSecret } from '../../../src/infrastructure/security/jwt-secret';

describe('requireStrongSecret', () => {
  it('accepts a long random secret', () => {
    const secret = randomBytes(48).toString('base64');

    expect(requireStrongSecret(secret)).toBe(secret);
  });

  it('refuses the placeholder published in .env.example', () => {
    expect(() => requireStrongSecret('troque-este-segredo-em-producao')).toThrow('JWT_SECRET');
  });

  it('refuses a short secret', () => {
    expect(() => requireStrongSecret('segredo')).toThrow('JWT_SECRET');
  });
});
