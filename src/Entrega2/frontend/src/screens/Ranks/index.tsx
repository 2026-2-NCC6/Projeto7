import { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Screen } from '../../components/Screen';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import type { RankingCategory } from '../../services/ranking/types';
import { useAuthStore } from '../../store/authStore';
import { BoardOverview } from './components/BoardOverview';
import { LeaderboardRow } from './components/LeaderboardRow';
import { RanksHeader } from './components/RanksHeader';
import { StandingPrompt } from './components/StandingPrompt';
import { ViewerStandingCard } from './components/ViewerStandingCard';
import { leaderboardStatusOf, viewerStandingOf } from './data/leaderboardView';
import { DEFAULT_RANKING_CATEGORY, rankingCategoryOf } from './data/rankingCategories';
import { listContentStyle, RowSeparator } from './styles';

export function RanksScreen() {
  const theme = useTheme();
  const isGuest = useAuthStore((state) => state.session === 'guest');
  const signOut = useAuthStore((state) => state.signOut);
  const [category, setCategory] = useState<RankingCategory>(DEFAULT_RANKING_CATEGORY);
  const leaderboard = useLeaderboard(category);
  const status = leaderboardStatusOf(category, leaderboard);
  const { formatValue } = rankingCategoryOf(category);
  const board = status.kind === 'ready' || status.kind === 'empty' ? status.board : null;
  const layout = status.kind === 'ready' ? status.layout : null;

  return (
    <Screen edges={['top']}>
      <FlatList
        data={layout?.rows ?? []}
        keyExtractor={(player, index) => `${player.position}-${index}`}
        renderItem={({ item }) => <LeaderboardRow player={item} formatValue={formatValue} />}
        ItemSeparatorComponent={RowSeparator}
        ListHeaderComponent={
          <>
            <RanksHeader
              category={category}
              total={board?.total ?? null}
              onSelectCategory={setCategory}
            />
            <BoardOverview status={status} formatValue={formatValue} onRetry={leaderboard.reload} />
          </>
        }
        ListFooterComponent={
          board ? (
            <StandingPrompt
              standing={viewerStandingOf(board, isGuest)}
              boardIsEmpty={board.entries.length === 0}
              onSignIn={signOut}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={leaderboard.loading && board !== null}
            onRefresh={leaderboard.reload}
            tintColor={theme.colors.primaryDark}
            colors={[theme.colors.primaryDark]}
            progressBackgroundColor={theme.colors.surfaceRaised}
          />
        }
        contentContainerStyle={listContentStyle(theme)}
        showsVerticalScrollIndicator={false}
      />
      {board && layout?.pinnedViewer ? (
        <ViewerStandingCard
          viewer={layout.pinnedViewer}
          total={board.total}
          formatValue={formatValue}
        />
      ) : null}
    </Screen>
  );
}
