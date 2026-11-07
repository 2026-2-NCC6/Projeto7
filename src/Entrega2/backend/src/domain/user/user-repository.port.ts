import { Account } from './account';
import { UserRole } from './role';
import { User } from './user.entity';

export interface UserListFilter {
  search?: string;
  role?: UserRole;
  limit: number;
  offset: number;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ageGroup: string | null;
  sessions: number;
  lastPlayedAt: Date | null;
  createdAt: Date;
}

export interface UserPage {
  items: UserListItem[];
  total: number;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  register(account: Account): Promise<void>;
  /** Invalidates every access token the user holds. */
  revokeTokens(userId: string): Promise<void>;
  save(user: User): Promise<void>;
  list(filter: UserListFilter): Promise<UserPage>;
  countByRole(): Promise<Record<UserRole, number>>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
