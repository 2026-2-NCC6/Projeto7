import { EmptyState, ErrorState, LoadingState } from '../../../../components/StateView';
import { texts } from '../../../../content/texts';
import type { LeaderboardStatus } from '../../data/leaderboardView';
import { Podium } from '../Podium';

interface BoardOverviewProps {
  status: LeaderboardStatus;
  formatValue: (value: number) => string;
  onRetry: () => void;
}

export function BoardOverview({ status, formatValue, onRetry }: BoardOverviewProps) {
  switch (status.kind) {
    case 'loading':
      return <LoadingState />;
    case 'error':
      return (
        <ErrorState
          message={status.message || texts.ranks.loadError}
          retryLabel={texts.ranks.retry}
          onRetry={onRetry}
        />
      );
    case 'empty':
      return <EmptyState title={texts.ranks.emptyTitle} message={texts.ranks.emptyMessage} />;
    case 'ready':
      return <Podium players={status.layout.podium} formatValue={formatValue} />;
  }
}
