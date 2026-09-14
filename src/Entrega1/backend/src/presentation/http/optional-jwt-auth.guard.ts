import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { TOKEN_VERIFIER, TokenVerifier } from '../../application/ports/token-issuer.port';
import { AuthenticatedRequest, extractBearerToken } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_VERIFIER) private readonly tokens: TokenVerifier) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    request.userId = token ? this.tokens.verify(token)?.sub : undefined;
    return true;
  }
}
