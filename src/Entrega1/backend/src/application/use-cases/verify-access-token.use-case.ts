import { UserRepository } from '../../domain/user/user-repository.port';
import { TokenVerifier } from '../ports/token-issuer.port';

/**
 * A valid signature is not enough: the token must also belong to a user that
 * still exists and was issued after the user's last sign-out.
 */
export class VerifyAccessTokenUseCase {
  constructor(
    private readonly tokens: TokenVerifier,
    private readonly users: UserRepository,
  ) {}

  async execute(token: string): Promise<string | null> {
    const payload = this.tokens.verify(token);

    if (!payload) {
      return null;
    }

    const user = await this.users.findById(payload.sub);

    return user && user.tokenVersion === payload.ver ? user.id : null;
  }
}
