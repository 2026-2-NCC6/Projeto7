import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TOKEN_VERIFIER, TokenVerifier } from '../../application/ports/token-issuer.port';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function extractBearerToken(request: Request): string | null {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme === 'Bearer' && token ? token : null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_VERIFIER) private readonly tokens: TokenVerifier) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    const payload = token ? this.tokens.verify(token) : null;

    if (!payload) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }

    request.userId = payload.sub;
    return true;
  }
}
