import { TokenPayload, TokenVerifier } from '../../../src/application/ports/token-issuer.port';
import { SignOutUseCase } from '../../../src/application/use-cases/sign-out.use-case';
import { VerifyAccessTokenUseCase } from '../../../src/application/use-cases/verify-access-token.use-case';
import { aUser, InMemoryUserRepository } from '../../support/fakes';

/** Tokens are their own payload here, so a test can forge any claim it needs. */
const verifier: TokenVerifier = {
  verify: (token) => (token.startsWith('{') ? (JSON.parse(token) as TokenPayload) : null),
};

const tokenFor = (sub: string, ver: number) => JSON.stringify({ sub, email: `${sub}@smash.test`, ver });

function setup() {
  const users = new InMemoryUserRepository([aUser('ana')]);
  return {
    verify: new VerifyAccessTokenUseCase(verifier, users),
    signOut: new SignOutUseCase(users),
  };
}

describe('VerifyAccessTokenUseCase', () => {
  it('accepts a token issued at the current version', async () => {
    const { verify } = setup();

    await expect(verify.execute(tokenFor('ana', 0))).resolves.toBe('ana');
  });

  it('rejects a bad signature', async () => {
    const { verify } = setup();

    await expect(verify.execute('forjado')).resolves.toBeNull();
  });

  it('rejects a token whose user no longer exists', async () => {
    const { verify } = setup();

    await expect(verify.execute(tokenFor('fantasma', 0))).resolves.toBeNull();
  });

  it('rejects every token issued before a sign-out, still within its expiry', async () => {
    const { verify, signOut } = setup();
    const before = tokenFor('ana', 0);

    await signOut.execute('ana');

    await expect(verify.execute(before)).resolves.toBeNull();
    await expect(verify.execute(tokenFor('ana', 1))).resolves.toBe('ana');
  });
});
