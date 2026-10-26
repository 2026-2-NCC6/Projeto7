import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';
import { SessionTicket, SessionTickets } from '../../application/ports/session-ticket.port';
import { GameMode } from '../../domain/game/game-mode';

/** Its own audience, so a ticket never passes as an access token, nor the reverse. */
const AUDIENCE = 'smash-session';
/** As long as the longest session the API accepts. */
const LIFETIME = '6h';

interface TicketClaims {
  sub: string;
  jti: string;
  mode: GameMode;
  level: number;
  startedAt: number;
}

export class JwtSessionTickets implements SessionTickets {
  constructor(private readonly secret: string) {}

  issue(ticket: SessionTicket): string {
    const claims: TicketClaims = {
      sub: ticket.userId,
      jti: ticket.id,
      mode: ticket.mode,
      level: ticket.level,
      startedAt: ticket.startedAt.getTime(),
    };

    return sign(claims, this.secret, { audience: AUDIENCE, expiresIn: LIFETIME });
  }

  verify(token: string): SessionTicket | null {
    try {
      const claims = verify(token, this.secret, { audience: AUDIENCE }) as TicketClaims;

      return {
        id: claims.jti,
        userId: claims.sub,
        mode: claims.mode,
        level: claims.level,
        startedAt: new Date(claims.startedAt),
      };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        return null;
      }
      throw error;
    }
  }
}
