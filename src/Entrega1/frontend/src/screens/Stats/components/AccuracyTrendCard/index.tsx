import { LineChart } from '../../../../components/charts/LineChart';
import { formatPercent } from '../../../../content/formatters';
import { texts } from '../../../../content/texts';
import type { RecentSession } from '../../../../services/statistics/types';
import { accuracyTrend } from '../../data/playerMetrics';
import { Caption } from '../StatsCard/styles';
import { StatsCard } from '../StatsCard';

const PERCENT_DOMAIN = 100;

interface AccuracyTrendCardProps {
  recentSessions: readonly RecentSession[];
}

export function AccuracyTrendCard({ recentSessions }: AccuracyTrendCardProps) {
  const values = accuracyTrend(recentSessions);
  const hasValues = values.some((value) => value !== null);
  const caption = texts.stats.accuracyTrendCaption(values.length);

  return (
    <StatsCard title={texts.stats.accuracyTrend} caption={caption}>
      {hasValues ? (
        <LineChart
          values={values}
          domainMax={PERCENT_DOMAIN}
          formatAxis={formatPercent}
          accessibilityLabel={caption}
        />
      ) : (
        <Caption>{texts.stats.accuracyTrendEmpty}</Caption>
      )}
    </StatsCard>
  );
}
