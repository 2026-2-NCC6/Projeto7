import { ExecutionContext } from '@nestjs/common';
import { VerifyAccessTokenUseCase } from '../../../src/application/use-cases/verify-access-token.use-case';
import { AuthenticatedRequest } from '../../../src/presentation/http/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../src/presentation/http/optional-jwt-auth.guard';
import { aUser, InMemoryUserRepository } from '../../support/fakes';

const verifyAccessToken = new VerifyAccessTokenUseCase(
  {
    verify: (token) =>
      token === 'valid' ? { sub: 'user-1', email: 'user-1@smash.test', ver: 0 } : null,
  },
  new InMemoryUserRepository([aUser('user-1')]),
);

function contextWith(authorization?: string): {
  context: ExecutionContext;
  request: AuthenticatedRequest;
} {
  const request = { headers: { authorization } } as AuthenticatedRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('OptionalJwtAuthGuard', () => {
  const guard = new OptionalJwtAuthGuard(verifyAccessToken);

  it('identifies a player with a valid token', async () => {
    const { context, request } = contextWith('Bearer valid');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.userId).toBe('user-1');
  });

  it.each([
    ['no header', undefined],
    ['an invalid token', 'Bearer expired'],
    ['a malformed header', 'Token valid'],
  ])('lets a request with %s through anonymously', async (_case, header) => {
    const { context, request } = contextWith(header);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.userId).toBeUndefined();
  });
});
