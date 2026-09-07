import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { ID_GENERATOR, IdGenerator } from '../../application/ports/id-generator.port';
import { PASSWORD_HASHER, PasswordHasher } from '../../application/ports/password-hasher.port';
import { TOKEN_ISSUER, TokenIssuer } from '../../application/ports/token-issuer.port';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user-repository.port';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: CreateUserUseCase,
      inject: [USER_REPOSITORY, PASSWORD_HASHER, TOKEN_ISSUER, ID_GENERATOR],
      useFactory: (
        users: UserRepository,
        hasher: PasswordHasher,
        tokens: TokenIssuer,
        ids: IdGenerator,
      ) => new CreateUserUseCase(users, hasher, tokens, ids),
    },
    {
      provide: AuthenticateUserUseCase,
      inject: [USER_REPOSITORY, PASSWORD_HASHER, TOKEN_ISSUER],
      useFactory: (users: UserRepository, hasher: PasswordHasher, tokens: TokenIssuer) =>
        new AuthenticateUserUseCase(users, hasher, tokens),
    },
  ],
})
export class AuthModule {}
