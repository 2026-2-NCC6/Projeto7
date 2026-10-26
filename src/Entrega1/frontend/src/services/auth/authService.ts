import { endpoints } from '../api/endpoints';
import { post } from '../api/httpClient';
import type { AuthenticatedUser, SignInRequest, SignUpRequest } from './types';

export const authService = {
  signUp(request: SignUpRequest): Promise<AuthenticatedUser> {
    return post<AuthenticatedUser>(endpoints.signUp, request);
  },

  signIn(request: SignInRequest): Promise<AuthenticatedUser> {
    return post<AuthenticatedUser>(endpoints.signIn, request);
  },

  /** Revokes the token on the server, so a copy of it stops working too. */
  async signOut(accessToken: string): Promise<void> {
    await post<unknown>(endpoints.signOut, {}, accessToken);
  },
};
