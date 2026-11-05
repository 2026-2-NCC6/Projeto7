import { NotFoundSessionError } from '../../domain/training-session/errors';
import {
  SessionDetail,
  SessionHistoryFilter,
  SessionHistoryRepository,
  SessionPage,
} from '../../domain/training-session/session-history';
import { UserRepository } from '../../domain/user/user-repository.port';
import { actorOf } from './actor';

export class SessionHistoryQueries {
  constructor(
    private readonly users: UserRepository,
    private readonly history: SessionHistoryRepository,
  ) {}

  mine(userId: string, filter: Omit<SessionHistoryFilter, 'userId' | 'authorId'>): Promise<SessionPage> {
    return this.history.list({ ...filter, userId });
  }

  async detail(userId: string, sessionId: string): Promise<SessionDetail> {
    const [actor, session] = await Promise.all([
      actorOf(this.users, userId),
      this.history.detail(sessionId),
    ]);

    const visible =
      session &&
      (actor.role === 'admin' ||
        session.userId === actor.id ||
        (actor.role === 'coach' && session.trainingAuthorId === actor.id));

    if (!visible) {
      throw new NotFoundSessionError();
    }

    return session;
  }
}
