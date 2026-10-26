import { UserRepository } from '../../domain/user/user-repository.port';

/** Ends every session of the user, on this device and any other. */
export class SignOutUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(userId: string): Promise<void> {
    return this.users.revokeTokens(userId);
  }
}
