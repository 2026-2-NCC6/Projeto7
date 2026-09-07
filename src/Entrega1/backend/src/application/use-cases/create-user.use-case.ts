import { openAccountFor } from '../../domain/user/account';
import { EmailAlreadyInUseError } from '../../domain/user/errors';
import { User } from '../../domain/user/user.entity';
import { UserRepository } from '../../domain/user/user-repository.port';
import { IdGenerator } from '../ports/id-generator.port';
import { PasswordHasher } from '../ports/password-hasher.port';
import { TokenIssuer } from '../ports/token-issuer.port';
import { AuthenticatedUser, toAuthenticatedUser } from './authenticated-user';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenIssuer,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: CreateUserInput): Promise<AuthenticatedUser> {
    const email = User.normalizeEmail(input.email);

    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyInUseError();
    }

    const user = User.register({
      id: this.ids.generate(),
      name: input.name,
      email,
      passwordHash: await this.hasher.hash(input.password),
    });

    await this.users.register(openAccountFor(user));

    return toAuthenticatedUser(user, this.tokens.issue({ sub: user.id, email: user.email }));
  }
}
