import { ConsoleLogger, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './jwt-auth.guard';

export interface AuditedRequest {
  method: string;
  path: string;
  status: number;
  ip: string | undefined;
  userId: string | undefined;
  email: unknown;
}

export interface AuditEntry {
  event: string;
  outcome: 'success' | 'failure';
  status: number;
  method: string;
  path: string;
  ip: string | null;
  userId?: string;
  email?: string;
}

/** Status codes that mean a client was refused: worth a line even outside /auth. */
const REFUSED = new Set([400, 401, 403, 409, 429]);

const AUTH_EVENTS: Record<string, string> = {
  '/auth/sign-in': 'auth.sign_in',
  '/auth/sign-up': 'auth.sign_up',
  '/auth/sign-out': 'auth.sign_out',
};

/** Enough of the address to tell attempts apart, never the whole of it. */
export function maskEmail(email: unknown): string | undefined {
  if (typeof email !== 'string' || !email.includes('@')) {
    return undefined;
  }

  const [name, domain] = email.trim().toLowerCase().split('@');
  return `${name.slice(0, 1)}***@${domain}`;
}

/**
 * The audit line for a finished request, or null when there is nothing worth
 * recording. Only metadata goes in: no body, no password, no token.
 */
export function auditEntryFor(request: AuditedRequest): AuditEntry | null {
  const authEvent = AUTH_EVENTS[request.path];
  const failed = request.status >= 400;

  if (!authEvent && !REFUSED.has(request.status) && request.status < 500) {
    return null;
  }

  const email = authEvent ? maskEmail(request.email) : undefined;

  return {
    event: authEvent ?? (request.status >= 500 ? 'request.failed' : 'request.refused'),
    outcome: failed ? 'failure' : 'success',
    status: request.status,
    method: request.method,
    path: request.path,
    ip: request.ip ?? null,
    ...(request.userId ? { userId: request.userId } : {}),
    ...(email ? { email } : {}),
  };
}

/** Writes one JSON line per security-relevant request, after the response is sent. */
@Injectable()
export class SecurityAuditMiddleware implements NestMiddleware {
  private readonly logger = new ConsoleLogger('Security', { json: true });

  use(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
    response.on('finish', () => {
      const entry = auditEntryFor({
        method: request.method,
        path: request.path,
        status: response.statusCode,
        ip: request.ip,
        userId: request.userId,
        email: (request.body as { email?: unknown } | undefined)?.email,
      });

      if (!entry) {
        return;
      }

      if (entry.outcome === 'failure') {
        this.logger.warn(entry);
      } else {
        this.logger.log(entry);
      }
    });

    next();
  }
}
