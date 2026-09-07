import type { User } from '../../types/user';

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  user: User;
  accessToken: string;
}
