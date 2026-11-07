import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { aLeaderboard, rankedPlayers } from '../../../test/fixtures';
import { deferred, renderWithProviders } from '../../../test/renderWithProviders';
import { ApiError } from '../../services/api/httpClient';
import { rankingService } from '../../services/ranking/rankingService';
import type { Leaderboard } from '../../services/ranking/types';
import { useAuthStore } from '../../store/authStore';
import { RanksScreen } from './index';

jest.mock('../../services/ranking/rankingService', () => ({
  rankingService: { leaderboard: jest.fn() },
}));

const leaderboard = jest.mocked(rankingService.leaderboard);

function signInAs(session: 'authenticated' | 'guest') {
  useAuthStore.setState({
    session,
    accessToken: session === 'authenticated' ? 'token' : null,
    user: null,
  });
}

beforeEach(() => {
  leaderboard.mockReset();
  signInAs('authenticated');
});

describe('RanksScreen', () => {
  it('shows a loader while the board is on its way', async () => {
    leaderboard.mockReturnValue(deferred<Leaderboard>().promise);

    await renderWithProviders(<RanksScreen />);

    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(leaderboard).toHaveBeenCalledWith('xp', 'token');
  });

  it('recovers from a failed request through retry', async () => {
    leaderboard
      .mockRejectedValueOnce(new ApiError('Não foi possível conectar ao servidor.', 0))
      .mockResolvedValueOnce(aLeaderboard());

    await renderWithProviders(<RanksScreen />);

    expect(await screen.findByText('Não foi possível conectar ao servidor.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Tentar novamente'));

    expect(await screen.findByTestId('podium-1')).toBeOnTheScreen();
  });

  it('explains an empty board', async () => {
    leaderboard.mockResolvedValue(aLeaderboard({ entries: [], total: 0 }));

    await renderWithProviders(<RanksScreen />);

    expect(await screen.findByText('Ninguém pontuou ainda')).toBeOnTheScreen();
    expect(screen.queryByText('Você ainda não está no ranking')).toBeNull();
  });

  it('renders a podium with a single player', async () => {
    leaderboard.mockResolvedValue(
      aLeaderboard({
        entries: rankedPlayers(1, 1),
        viewer: { position: 1, name: 'Jogador 1', value: 150, isViewer: true },
      }),
    );

    await renderWithProviders(<RanksScreen />);

    expect(await screen.findByTestId('podium-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('podium-2')).toBeNull();
    expect(screen.getByText('1 jogador classificado')).toBeOnTheScreen();
    expect(screen.getByText('Você')).toBeOnTheScreen();
  });

  it('gives tied leaders the same podium treatment', async () => {
    leaderboard.mockResolvedValue(aLeaderboard({
      entries: [
        { position: 1, name: 'Ana', value: 500, isViewer: false },
        { position: 1, name: 'Bia', value: 500, isViewer: false },
        { position: 3, name: 'Carla', value: 100, isViewer: false },
      ],
    }));

    await renderWithProviders(<RanksScreen />);

    const leader = await screen.findByTestId('podium-1');
    const tiedLeader = screen.getByTestId('podium-2');
    const firstStep = within(leader).getByText('1').parent;
    const tiedStep = within(tiedLeader).getByText('1').parent;

    expect(tiedStep?.props.style).toEqual(firstStep?.props.style);
  });

  it('highlights the viewer in the list without pinning them', async () => {
    leaderboard.mockResolvedValue(
      aLeaderboard({
        entries: rankedPlayers(10, 5),
        viewer: { position: 5, name: 'Jogador 5', value: 900, isViewer: true },
      }),
    );

    await renderWithProviders(<RanksScreen />);

    expect(await screen.findByText('Jogador 5')).toBeOnTheScreen();
    expect(screen.getByText('Você')).toBeOnTheScreen();
    expect(screen.queryByTestId('viewer-standing')).toBeNull();
  });

  it('pins a viewer ranked far below the visible board', async () => {
    leaderboard.mockResolvedValue(
      aLeaderboard({
        entries: rankedPlayers(50),
        total: 200,
        viewer: { position: 134, name: 'Ana', value: 3_210, isViewer: true },
      }),
    );

    await renderWithProviders(<RanksScreen />);

    const standing = await screen.findByTestId('viewer-standing');
    expect(standing).toHaveTextContent(/#134 de 200/);
    expect(standing).toHaveTextContent(/3\.210 XP/);
    expect(screen.getByText('200 jogadores classificados')).toBeOnTheScreen();
  });

  it('invites a signed-in player who has not scored yet', async () => {
    leaderboard.mockResolvedValue(aLeaderboard());

    await renderWithProviders(<RanksScreen />);

    expect(await screen.findByText('Você ainda não está no ranking')).toBeOnTheScreen();
  });

  it('shows the public board to guests with a sign-in invitation', async () => {
    signInAs('guest');
    leaderboard.mockResolvedValue(aLeaderboard());

    await renderWithProviders(<RanksScreen />);

    expect(await screen.findByText('Entre para competir')).toBeOnTheScreen();
    expect(leaderboard).toHaveBeenCalledWith('xp', null);

    await fireEvent.press(screen.getByText('Entrar ou criar conta'));

    expect(useAuthStore.getState().session).toBe('none');
  });

  it('keeps long names on a single truncated line', async () => {
    const longName = 'Maria Eduarda Albuquerque de Vasconcelos Figueiredo Nascimento';
    const entries = rankedPlayers(5).map((player) =>
      player.position === 4 ? { ...player, name: longName } : player,
    );
    leaderboard.mockResolvedValue(aLeaderboard({ entries }));

    await renderWithProviders(<RanksScreen />);

    expect(await screen.findByText(longName)).toHaveProp('numberOfLines', 1);
  });

  it('loads another category when its chip is selected', async () => {
    leaderboard.mockImplementation(async (category) =>
      aLeaderboard({ category, entries: rankedPlayers(4) }),
    );

    await renderWithProviders(<RanksScreen />);
    await screen.findByTestId('podium-1');

    await fireEvent.press(screen.getByText('Ofensiva'));

    await waitFor(() => expect(leaderboard).toHaveBeenLastCalledWith('dailyStreak', 'token'));
    expect(await screen.findByText('Maior sequência de dias treinando')).toBeOnTheScreen();
    expect(await screen.findByText('150 dias')).toBeOnTheScreen();
  });

  it('renders a large board in the dark theme', async () => {
    leaderboard.mockResolvedValue(
      aLeaderboard({ entries: rankedPlayers(50), total: 12_000 }),
    );

    await renderWithProviders(<RanksScreen />, { mode: 'dark' });

    expect(await screen.findByText('12.000 jogadores classificados')).toBeOnTheScreen();
    expect(screen.getByText('Jogador 4')).toBeOnTheScreen();
  });
});
