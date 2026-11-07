import { useTheme } from 'styled-components/native';
import { WALL_ROWS, WALL_TARGETS, type TargetId } from '../../../device/contracts';
import type { TargetColor } from '../../../types/game';
import { TargetCell, type CellPulse } from './TargetCell';
import { Grid, GridRow } from './styles';

export interface TargetGridProps {
  /** Colours that score this level. Anything else renders muted. */
  activeColors: readonly TargetColor[];
  valueOf: (color: TargetColor) => string;
  pulse: (CellPulse & { targetId: TargetId }) | null;
  popForeground: string;
}

export function TargetGrid({ activeColors, valueOf, pulse, popForeground }: TargetGridProps) {
  const theme = useTheme();

  return (
    <Grid>
      {WALL_ROWS.map((row) => (
        <GridRow key={row}>
          {WALL_TARGETS.filter((target) => target.row === row).map((target) => {
            const tone = theme.colors.target[target.color];

            return (
              <TargetCell
                key={target.id}
                target={target}
                fill={tone.background}
                foreground={tone.foreground}
                muted={!activeColors.includes(target.color)}
                value={valueOf(target.color)}
                pulse={pulse && pulse.targetId === target.id ? pulse : null}
                popForeground={popForeground}
              />
            );
          })}
        </GridRow>
      ))}
    </Grid>
  );
}
