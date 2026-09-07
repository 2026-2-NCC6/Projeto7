import { Account } from './account';
import { User } from './user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  register(account: Account): Promise<void>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
