import { User } from '../../domain/user/user.entity';

export interface AuthenticatedUser {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
}

export function toAuthenticatedUser(user: User, accessToken: string): AuthenticatedUser {
  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
  };
}
