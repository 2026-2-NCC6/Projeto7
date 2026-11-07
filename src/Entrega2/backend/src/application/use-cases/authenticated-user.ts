import { UserRole } from '../../domain/user/role';
import { User } from '../../domain/user/user.entity';

export interface AuthenticatedUser {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
}

export function toAuthenticatedUser(user: User, accessToken: string): AuthenticatedUser {
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  };
}
