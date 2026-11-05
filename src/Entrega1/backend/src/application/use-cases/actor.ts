import { Actor } from '../../domain/training/training.entity';
import { ForbiddenActionError, UserNotFoundError } from '../../domain/user/errors';
import { UserRole } from '../../domain/user/role';
import { UserRepository } from '../../domain/user/user-repository.port';

export async function actorOf(users: UserRepository, userId: string): Promise<Actor> {
  const user = await users.findById(userId);

  if (!user) {
    throw new UserNotFoundError();
  }

  return { id: user.id, role: user.role };
}

export function assertRole(actor: Actor, ...roles: UserRole[]): void {
  if (!roles.includes(actor.role)) {
    throw new ForbiddenActionError();
  }
}
