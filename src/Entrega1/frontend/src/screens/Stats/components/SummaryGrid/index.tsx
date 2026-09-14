import { StatCard } from '../../../../components/StatCard';
import type { StatTile } from '../../data/playerMetrics';
import { Grid, GridRow } from './styles';

const COLUMNS = 2;

interface SummaryGridProps {
  tiles: readonly StatTile[];
}

export function SummaryGrid({ tiles }: SummaryGridProps) {
  const rows = Array.from({ length: Math.ceil(tiles.length / COLUMNS) }, (_, index) =>
    tiles.slice(index * COLUMNS, index * COLUMNS + COLUMNS),
  );

  return (
    <Grid>
      {rows.map((row) => (
        <GridRow key={row.map((tile) => tile.key).join('-')}>
          {row.map((tile) => (
            <StatCard key={tile.key} value={tile.value} label={tile.label} />
          ))}
        </GridRow>
      ))}
    </Grid>
  );
}
