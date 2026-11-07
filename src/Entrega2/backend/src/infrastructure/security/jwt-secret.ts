/** The placeholder in .env.example: anyone who read the repository knows it. */
const EXAMPLE_SECRET = 'troque-este-segredo-em-producao';
const MIN_LENGTH = 32;

/**
 * Every token and session ticket is signed with this secret, so a guessable one
 * lets anyone forge a player's token. The API refuses to start with it.
 */
export function requireStrongSecret(secret: string): string {
  if (secret === EXAMPLE_SECRET || secret.length < MIN_LENGTH) {
    throw new Error(
      `JWT_SECRET fraco: use um valor aleatório com ${MIN_LENGTH} caracteres ou mais (openssl rand -base64 48).`,
    );
  }

  return secret;
}
