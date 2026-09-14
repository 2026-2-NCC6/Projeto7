import { EmptyState, ErrorState, LoadingState } from '../../../../components/StateView';
import { texts } from '../../../../content/texts';
import type { RemoteResource } from '../../../../hooks/useRemoteResource';
import type { PlayerStatistics } from '../../../../services/statistics/types';
import { PlayerDashboard } from '../PlayerDashboard';

interface PlayerSectionProps {
  isGuest: boolean;
  resource: RemoteResource<PlayerStatistics>;
  onSignIn: () => void;
}

export function PlayerSection({ isGuest, resource, onSignIn }: PlayerSectionProps) {
  if (isGuest) {
    return (
      <EmptyState
        title={texts.stats.guestTitle}
        message={texts.stats.guestMessage}
        action={{ label: texts.stats.guestAction, onPress: onSignIn }}
      />
    );
  }

  if (resource.error) {
    return (
      <ErrorState
        message={resource.error || texts.stats.loadError}
        retryLabel={texts.stats.retry}
        onRetry={resource.reload}
      />
    );
  }

  if (!resource.data) {
    return <LoadingState />;
  }

  return <PlayerDashboard statistics={resource.data} />;
}
