import { useTheme } from 'styled-components/native';
import { texts } from '../../../../content/texts';
import { MeterBar } from '../../../../gameplay/components/MeterBar';
import type { TargetBreakdown } from '../../../../services/statistics/types';
import { colorAccuracy, wallCells } from '../../data/wallMetrics';
import { StatsCard } from '../StatsCard';
import {
  Cell,
  CellLabel,
  ColorName,
  ColorRow,
  ColorRows,
  ColorSwatch,
  ColorValue,
  Divider,
  Grid,
  GridRow,
  Meter,
  Shade,
  Subheading,
  Swatch,
} from './styles';

const GRID_ROWS = [1, 2, 3] as const;
const STRONG_SHADE = 0.55;

interface WallCardProps {
  targets: readonly TargetBreakdown[];
}

export function WallCard({ targets }: WallCardProps) {
  const theme = useTheme();
  const cells = wallCells(targets);

  return (
    <StatsCard title={texts.stats.wall} caption={texts.stats.wallCaption}>
      <Grid>
        {GRID_ROWS.map((row) => (
          <GridRow key={row}>
            {cells
              .filter((cell) => cell.target.row === row)
              .map((cell) => (
                <Cell
                  key={cell.target.id}
                  testID={`wall-cell-${cell.target.id}`}
                  accessible
                  accessibilityLabel={`${texts.stats.target(cell.target.id)}: ${cell.label}`}
                >
                  <Shade intensity={cell.intensity} />
                  <Swatch color={theme.colors.target[cell.target.color].background} />
                  <CellLabel strong={cell.intensity >= STRONG_SHADE}>{cell.label}</CellLabel>
                </Cell>
              ))}
          </GridRow>
        ))}
      </Grid>

      <Divider />
      <Subheading>{texts.stats.colorAccuracy}</Subheading>
      <ColorRows>
        {colorAccuracy(targets).map((entry) => (
          <ColorRow key={entry.color} testID={`color-accuracy-${entry.color}`}>
            <ColorSwatch color={theme.colors.target[entry.color].background} />
            <ColorName numberOfLines={1} adjustsFontSizeToFit>
              {entry.label}
            </ColorName>
            <Meter>
              <MeterBar
                percentage={entry.percent ?? 0}
                fillColor={theme.colors.target[entry.color].background}
                trackColor={theme.colors.border}
                thickness={theme.sizes.progressBarSmall}
              />
            </Meter>
            <ColorValue numberOfLines={1}>{entry.valueLabel}</ColorValue>
          </ColorRow>
        ))}
      </ColorRows>
    </StatsCard>
  );
}
