import { InvalidCredentialsError } from '../../domain/user/errors';
import { User } from '../../domain/user/user.entity';
import { UserRepository } from '../../domain/user/user-repository.port';
import { PasswordHasher } from '../ports/password-hasher.port';
import { TokenIssuer } from '../ports/token-issuer.port';
import { AuthenticatedUser, toAuthenticatedUser } from './authenticated-user';

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenIssuer,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthenticatedUser> {
    const user = await this.users.findByEmail(User.normalizeEmail(input.email));

    if (!user || !(await this.hasher.compare(input.password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    return toAuthenticatedUser(user, this.tokens.issue({ sub: user.id, email: user.email }));
  }
}
