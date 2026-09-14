import { act, cleanup, fireEvent, screen, within } from '@testing-library/react-native';
import { emptyStatistics, emptyTargets, fullStatistics } from '../../../test/fixtures';
import {
  deferred,
  fakeDeviceContext,
  renderWithProviders,
} from '../../../test/renderWithProviders';
import { INITIAL_DEVICE_TELEMETRY } from '../../device/runtime/device-telemetry';
import { ApiError } from '../../services/api/httpClient';
import { statisticsService } from '../../services/statistics/statisticsService';
import type { PlayerStatistics } from '../../services/statistics/types';
import { useAuthStore } from '../../store/authStore';
import { StatsScreen } from './index';

jest.mock('../../services/statistics/statisticsService', () => ({
  statisticsService: { statistics: jest.fn() },
}));

const statistics = jest.mocked(statisticsService.statistics);

function signInAs(session: 'authenticated' | 'guest') {
  useAuthStore.setState({
    session,
    accessToken: session === 'authenticated' ? 'token' : null,
    user: null,
  });
}

async function layout(element: unknown, width: number) {
  await fireEvent(element as never, 'layout', { nativeEvent: { layout: { width, height: 100 } } });
}

async function layoutBarChart(label: string, width: number) {
  await layout(screen.getByLabelText(label).children[1], width);
}

async function layoutLineChart(label: string, width: number) {
  await layout(screen.getByLabelText(label), width);
}

beforeEach(() => {
  jest.useFakeTimers();
  statistics.mockReset();
  signInAs('authenticated');
});

afterEach(async () => {
  await cleanup();
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe('StatsScreen', () => {
  it('asks guests to sign in but still shows device, system and web access', async () => {
    signInAs('guest');

    await renderWithProviders(<StatsScreen />);

    expect(screen.getByText('Suas estatísticas ficam na sua conta')).toBeOnTheScreen();
    expect(statistics).not.toHaveBeenCalled();
    expect(screen.getByText('Parede e dispositivo')).toBeOnTheScreen();
    expect(screen.getByText('Sistema')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Abrir painel web' })).toBeDisabled();

    await fireEvent.press(screen.getByText('Entrar ou criar conta'));
    expect(useAuthStore.getState().session).toBe('none');
  });

  it('shows a loader for player data while the device panel stays available', async () => {
    statistics.mockReturnValue(deferred<PlayerStatistics>().promise);

    await renderWithProviders(<StatsScreen />);

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(screen.getByTestId('data-status')).toHaveTextContent(/Conectado/);
  });

  it('recovers from an error through retry', async () => {
    statistics
      .mockRejectedValueOnce(new ApiError('Sessão inválida ou expirada.', 401))
      .mockResolvedValueOnce(fullStatistics());

    await renderWithProviders(<StatsScreen />);

    expect(await screen.findByText('Sessão inválida ou expirada.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Tentar novamente'));

    expect(await screen.findByText('Atividade')).toBeOnTheScreen();
  });

  it('guides a player with no sessions instead of drawing empty charts', async () => {
    statistics.mockResolvedValue(emptyStatistics());

    await renderWithProviders(<StatsScreen />);

    expect(await screen.findByText('Nenhuma sessão registrada')).toBeOnTheScreen();
    expect(screen.getByText('Nível 0 · jogando desde março de 2026')).toBeOnTheScreen();
    expect(screen.queryByText('Atividade')).toBeNull();
    expect(screen.queryByText('Mapa da parede')).toBeNull();
  });

  it('renders the full dashboard', async () => {
    statistics.mockResolvedValue(fullStatistics());

    await renderWithProviders(<StatsScreen />);

    expect(await screen.findByText('2h 05min')).toBeOnTheScreen();
    expect(screen.getByText('640 ms')).toBeOnTheScreen();
    expect(screen.getByText('Evolução da precisão')).toBeOnTheScreen();
    expect(screen.getAllByTestId(/^wall-cell-/)).toHaveLength(9);
    expect(screen.getByTestId('impact-5')).toHaveTextContent(/Média 1\.800 · Pico 3\.100/);
    expect(screen.getAllByTestId(/^mode-/)).toHaveLength(4);
    expect(screen.getAllByTestId('recent-session')).toHaveLength(10);
    expect(screen.getByTestId('data-rank')).toHaveTextContent(/#12 de 340/);
    expect(screen.getByText('Progresso')).toBeOnTheScreen();
  });

  it('draws one bar per day and switches between 7 and 30 days', async () => {
    statistics.mockResolvedValue(fullStatistics());

    await renderWithProviders(<StatsScreen />);
    const caption = await screen.findByText(/nos últimos 7 dias/);

    await layoutBarChart(caption.props.children, 320);
    expect(screen.getAllByTestId(/^bar-/)).toHaveLength(7);

    await fireEvent.press(screen.getByText('30 dias'));
    const longCaption = await screen.findByText(/nos últimos 30 dias/);

    await layoutBarChart(longCaption.props.children, 320);
    expect(screen.getAllByTestId(/^bar-/)).toHaveLength(30);
  });

  it('draws the accuracy trend even with a single session', async () => {
    const data = fullStatistics();
    statistics.mockResolvedValue({ ...data, recentSessions: data.recentSessions.slice(0, 1) });

    await renderWithProviders(<StatsScreen />);
    await screen.findByText('Evolução da precisão');

    await layoutLineChart('Última sessão', 280);
    expect(screen.getAllByTestId('line-point')).toHaveLength(1);
  });

  it('handles partial telemetry without per-target data or sensor readings', async () => {
    statistics.mockResolvedValue({ ...fullStatistics(), targets: emptyTargets() });

    await renderWithProviders(<StatsScreen />);

    expect(
      await screen.findByText('Os acertos por alvo aparecem depois da próxima sessão.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Aguardando sessões jogadas na parede real.')).toBeOnTheScreen();
    expect(screen.getByTestId('data-firmwareVersion')).toHaveTextContent(/Indisponível/);
  });

  it('shows live wall telemetry and lets the player reconnect', async () => {
    const device = fakeDeviceContext(
      {
        telemetry: { ...INITIAL_DEVICE_TELEMETRY, hitsReceived: 87, faultsReceived: 3 },
        lastFault: { kind: 'fault', code: 'duplicateEvent', detail: '', at: 1 },
      },
      'lost',
    );
    statistics.mockResolvedValue(fullStatistics());

    await renderWithProviders(<StatsScreen />, { device });

    const status = await screen.findByTestId('data-status');
    expect(within(status).getByText('Conexão perdida')).toBeOnTheScreen();
    expect(screen.getByTestId('data-hitsReceived')).toHaveTextContent(/87/);
    expect(screen.getByTestId('data-lastFault')).toHaveTextContent(/Evento duplicado/);

    await fireEvent.press(screen.getByText('Reconectar'));
    expect(device.reconnect).toHaveBeenCalled();
  });

  it('renders huge values in the dark theme', async () => {
    const data = fullStatistics();
    statistics.mockResolvedValue({
      ...data,
      summary: { ...data.summary, sessions: 9_876_543, totalScore: 2_000_000_000 },
    });

    await renderWithProviders(<StatsScreen />, { mode: 'dark' });

    expect(await screen.findByText('9,9M')).toBeOnTheScreen();
    expect(screen.getByTestId('data-totalScore')).toHaveTextContent(/2\.000\.000\.000/);
  });
});
