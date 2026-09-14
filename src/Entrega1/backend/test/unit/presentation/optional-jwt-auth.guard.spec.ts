import { ExecutionContext } from '@nestjs/common';
import { TokenVerifier } from '../../../src/application/ports/token-issuer.port';
import { AuthenticatedRequest } from '../../../src/presentation/http/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../src/presentation/http/optional-jwt-auth.guard';

const verifier: TokenVerifier = {
  verify: (token) => (token === 'valid' ? { sub: 'user-1', email: 'user@smash.test' } : null),
};

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
  const guard = new OptionalJwtAuthGuard(verifier);

  it('identifies a player with a valid token', () => {
    const { context, request } = contextWith('Bearer valid');

    expect(guard.canActivate(context)).toBe(true);
    expect(request.userId).toBe('user-1');
  });

  it.each([
    ['no header', undefined],
    ['an invalid token', 'Bearer expired'],
    ['a malformed header', 'Token valid'],
  ])('lets a request with %s through anonymously', (_case, header) => {
    const { context, request } = contextWith(header);

    expect(guard.canActivate(context)).toBe(true);
    expect(request.userId).toBeUndefined();
  });
});
