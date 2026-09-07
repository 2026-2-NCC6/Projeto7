import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';
import { TokenIssuer, TokenPayload, TokenVerifier } from '../../application/ports/token-issuer.port';

export class JwtTokenService implements TokenIssuer, TokenVerifier {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  issue(payload: TokenPayload): string {
    return sign(payload, this.secret, { expiresIn: this.expiresIn } as never);
  }

  verify(token: string): TokenPayload | null {
    try {
      return verify(token, this.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        return null;
      }
      throw error;
    }
  }
}
