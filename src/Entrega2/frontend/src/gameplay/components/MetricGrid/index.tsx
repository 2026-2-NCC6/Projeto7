import styled from 'styled-components/native';
import { StatCard } from '../../../components/StatCard';

const Column = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

const Filler = styled.View`
  flex: 1;
`;

const PER_ROW = 2;

export interface Metric {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

function inPairs(metrics: readonly Metric[]): Metric[][] {
  return metrics.reduce<Metric[][]>((rows, metric, index) => {
    if (index % PER_ROW === 0) {
      rows.push([]);
    }
    rows[rows.length - 1].push(metric);
    return rows;
  }, []);
}

interface MetricGridProps {
  metrics: readonly Metric[];
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <Column>
      {inPairs(metrics).map((row) => (
        <Row key={row[0].key}>
          {row.map((metric) => (
            <StatCard key={metric.key} value={metric.value} label={metric.label} />
          ))}
          {row.length < PER_ROW ? <Filler /> : null}
        </Row>
      ))}
    </Column>
  );
}
