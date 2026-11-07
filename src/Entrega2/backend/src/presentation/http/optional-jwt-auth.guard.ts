import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { VerifyAccessTokenUseCase } from '../../application/use-cases/verify-access-token.use-case';
import { AuthenticatedRequest, extractBearerToken } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    @Inject(VerifyAccessTokenUseCase) private readonly verifyAccessToken: VerifyAccessTokenUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    request.userId = (token ? await this.verifyAccessToken.execute(token) : null) ?? undefined;
    return true;
  }
}
