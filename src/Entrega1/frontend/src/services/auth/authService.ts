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
};
