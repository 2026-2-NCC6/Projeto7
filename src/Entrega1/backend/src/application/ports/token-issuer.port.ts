export interface TokenPayload {
  sub: string;
  email: string;
}

export interface TokenIssuer {
  issue(payload: TokenPayload): string;
}

export interface TokenVerifier {
  verify(token: string): TokenPayload | null;
}

export const TOKEN_ISSUER = Symbol('TokenIssuer');
export const TOKEN_VERIFIER = Symbol('TokenVerifier');
