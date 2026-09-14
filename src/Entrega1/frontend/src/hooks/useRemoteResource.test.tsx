import { act, renderHook, waitFor } from '@testing-library/react-native';
import { deferred } from '../../test/renderWithProviders';
import { useLevelProgressStore } from '../gameplay/store/levelProgressStore';
import { ApiError } from '../services/api/httpClient';
import { useRemoteResource, type ResourceLoader } from './useRemoteResource';

describe('useRemoteResource', () => {
  it('does nothing without a loader', async () => {
    const { result } = await renderHook(() => useRemoteResource<number>(null));

    expect(result.current).toMatchObject({ data: null, loading: false, error: null });
  });

  it('loads, then exposes the data', async () => {
    const pending = deferred<number>();
    const loader = jest.fn(() => pending.promise);
    const { result } = await renderHook(() => useRemoteResource(loader));

    expect(result.current.loading).toBe(true);

    await act(async () => pending.resolve(42));

    expect(result.current).toMatchObject({ data: 42, loading: false, error: null });
  });

  it('exposes the API message on failure and recovers on reload', async () => {
    const loader = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new ApiError('Servidor fora do ar', 503))
      .mockResolvedValueOnce('ok');
    const { result } = await renderHook(() => useRemoteResource(loader));

    await waitFor(() => expect(result.current.error).toBe('Servidor fora do ar'));

    await act(async () => result.current.reload());

    await waitFor(() => expect(result.current.data).toBe('ok'));
    expect(result.current.error).toBeNull();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('ignores a slow response from a loader that was replaced', async () => {
    const slow = deferred<string>();
    const fast = deferred<string>();
    const first: ResourceLoader<string> = () => slow.promise;
    const second: ResourceLoader<string> = () => fast.promise;
    const { result, rerender } = await renderHook(
      ({ loader }: { loader: ResourceLoader<string> }) => useRemoteResource(loader),
      { initialProps: { loader: first } },
    );

    await rerender({ loader: second });
    await act(async () => fast.resolve('segunda categoria'));
    await act(async () => slow.resolve('primeira categoria'));

    expect(result.current.data).toBe('segunda categoria');
  });

  it('refetches after a session is synced', async () => {
    const loader = jest.fn(async () => 'dados');
    await renderHook(() => useRemoteResource(loader));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));

    await act(async () => useLevelProgressStore.getState().markSynced());

    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
  });
});
