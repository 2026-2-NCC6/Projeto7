import { texts } from '../../../../content/texts';
import type { RankedPlayer } from '../../../../services/ranking/types';
import { LeaderboardRow } from '../LeaderboardRow';
import { Dock, Eyebrow, Header, Standing } from './styles';

interface ViewerStandingCardProps {
  viewer: RankedPlayer;
  total: number;
  formatValue: (value: number) => string;
}

export function ViewerStandingCard({ viewer, total, formatValue }: ViewerStandingCardProps) {
  return (
    <Dock testID="viewer-standing">
      <Header>
        <Eyebrow>{texts.ranks.yourPosition.toUpperCase()}</Eyebrow>
        <Standing numberOfLines={1}>{texts.ranks.positionOf(viewer.position, total)}</Standing>
      </Header>
      <LeaderboardRow player={viewer} formatValue={formatValue} />
    </Dock>
  );
}
