import { ThrottlerModuleOptions } from '@nestjs/throttler';

const MINUTE_MS = 60_000;

function emailOf(request: { body?: { email?: unknown } }): string | null {
  const email = request.body?.email;
  return typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
}

/**
 * Two counters on sign-in and sign-up, so a password guesser is slowed down
 * whether it hammers one account from many addresses or many accounts from one.
 * Going over a limit blocks for longer than the window it was counted in.
 */
export const AUTH_THROTTLING: ThrottlerModuleOptions = {
  errorMessage: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  throttlers: [
    {
      name: 'ip',
      ttl: MINUTE_MS,
      limit: 10,
      blockDuration: 5 * MINUTE_MS,
    },
    {
      name: 'email',
      ttl: 15 * MINUTE_MS,
      limit: 5,
      blockDuration: 15 * MINUTE_MS,
      getTracker: (request) => emailOf(request) ?? request.ip,
    },
  ],
};
