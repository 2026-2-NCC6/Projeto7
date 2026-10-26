import { Global, Module } from '@nestjs/common';
import { TOKEN_VERIFIER, TokenVerifier } from '../../application/ports/token-issuer.port';
import { VerifyAccessTokenUseCase } from '../../application/use-cases/verify-access-token.use-case';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user-repository.port';

/** What both auth guards need, available to every module that declares them. */
@Global()
@Module({
  providers: [
    {
      provide: VerifyAccessTokenUseCase,
      inject: [TOKEN_VERIFIER, USER_REPOSITORY],
      useFactory: (tokens: TokenVerifier, users: UserRepository) =>
        new VerifyAccessTokenUseCase(tokens, users),
    },
  ],
  exports: [VerifyAccessTokenUseCase],
})
export class AccessTokenModule {}
