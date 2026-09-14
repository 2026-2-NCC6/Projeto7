import { useTheme } from 'styled-components/native';
import { Icon } from '../../../../components/Icon';
import { IconTile } from '../../../../components/IconTile';
import { texts } from '../../../../content/texts';
import { MeterBar } from '../../../../gameplay/components/MeterBar';
import type { ModeBreakdown } from '../../../../services/statistics/types';
import { modeRows } from '../../data/playerMetrics';
import { StatsCard } from '../StatsCard';
import { Detail, Labels, ModeName, ModeSummary, Row, RowHeader, Rows } from './styles';

interface ModeBreakdownCardProps {
  modes: readonly ModeBreakdown[];
}

export function ModeBreakdownCard({ modes }: ModeBreakdownCardProps) {
  const theme = useTheme();

  return (
    <StatsCard title={texts.stats.modes}>
      <Rows>
        {modeRows(modes).map((row) => (
          <Row key={row.mode} testID={`mode-${row.mode}`}>
            <RowHeader>
              <IconTile diameter={theme.sizes.gameChip} background={theme.colors.primarySoft}>
                <Icon name={row.icon} size={theme.sizes.iconSmall} color={theme.colors.primaryDark} />
              </IconTile>
              <Labels>
                <ModeName>{row.label}</ModeName>
                <ModeSummary>{row.summary}</ModeSummary>
              </Labels>
              <Detail>
                {row.detail}
              </Detail>
            </RowHeader>
            <MeterBar
              percentage={row.sharePercent}
              fillColor={theme.colors.primaryDark}
              trackColor={theme.colors.border}
              thickness={theme.sizes.progressBarSmall}
            />
          </Row>
        ))}
      </Rows>
    </StatsCard>
  );
}
