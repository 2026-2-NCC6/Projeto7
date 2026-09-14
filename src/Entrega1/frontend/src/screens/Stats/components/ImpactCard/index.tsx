import { useTheme } from 'styled-components/native';
import { texts } from '../../../../content/texts';
import { MeterBar } from '../../../../gameplay/components/MeterBar';
import type { TargetBreakdown } from '../../../../services/statistics/types';
import { impactRows } from '../../data/wallMetrics';
import { StatsCard } from '../StatsCard';
import { Reading, Row, RowHeader, Rows, Swatch, TargetName, Waiting } from './styles';

interface ImpactCardProps {
  targets: readonly TargetBreakdown[];
}

export function ImpactCard({ targets }: ImpactCardProps) {
  const theme = useTheme();
  const rows = impactRows(targets);

  return (
    <StatsCard title={texts.stats.impact} caption={texts.stats.impactCaption}>
      {rows.length === 0 ? (
        <Waiting>{texts.stats.impactEmpty}</Waiting>
      ) : (
        <Rows>
          {rows.map((row) => (
            <Row key={row.target.id} testID={`impact-${row.target.id}`}>
              <RowHeader>
                <Swatch color={theme.colors.target[row.target.color].background} />
                <TargetName>{row.label}</TargetName>
                <Reading numberOfLines={1} adjustsFontSizeToFit>
                  {row.valueLabel}
                </Reading>
              </RowHeader>
              <MeterBar
                percentage={row.averagePercent}
                fillColor={theme.colors.target[row.target.color].background}
                trackColor={theme.colors.border}
                thickness={theme.sizes.progressBarSmall}
              />
            </Row>
          ))}
        </Rows>
      )}
    </StatsCard>
  );
}
