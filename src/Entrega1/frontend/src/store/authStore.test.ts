import { authService } from '../services/auth/authService';
import { useAuthStore } from './authStore';

jest.mock('../services/auth/authService', () => ({
  authService: { signOut: jest.fn(() => Promise.resolve()) },
}));

describe('authStore.signOut', () => {
  beforeEach(() => jest.mocked(authService.signOut).mockClear());

  it('revokes the token on the server and forgets it locally', () => {
    useAuthStore.setState({ session: 'authenticated', accessToken: 'token-1', user: null });

    useAuthStore.getState().signOut();

    expect(authService.signOut).toHaveBeenCalledWith('token-1');
    expect(useAuthStore.getState()).toMatchObject({ session: 'none', accessToken: null });
  });

  it('signs out at once even when the server cannot be reached', () => {
    jest.mocked(authService.signOut).mockRejectedValueOnce(new Error('offline'));
    useAuthStore.setState({ session: 'authenticated', accessToken: 'token-1', user: null });

    useAuthStore.getState().signOut();

    expect(useAuthStore.getState().session).toBe('none');
  });

  it('has nothing to revoke for a guest', () => {
    useAuthStore.setState({ session: 'guest', accessToken: null, user: null });

    useAuthStore.getState().signOut();

    expect(authService.signOut).not.toHaveBeenCalled();
  });
});
