import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { VerifyAccessTokenUseCase } from '../../application/use-cases/verify-access-token.use-case';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function extractBearerToken(request: Request): string | null {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme === 'Bearer' && token ? token : null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(VerifyAccessTokenUseCase) private readonly verifyAccessToken: VerifyAccessTokenUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    const userId = token ? await this.verifyAccessToken.execute(token) : null;

    if (!userId) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }

    request.userId = userId;
    return true;
  }
}
