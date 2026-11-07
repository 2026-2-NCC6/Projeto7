import { useState } from 'react';
import { BarChart } from '../../../../components/charts/BarChart';
import { PillToggle } from '../../../../components/PillToggle';
import { formatNumber } from '../../../../content/formatters';
import { texts } from '../../../../content/texts';
import type { DailyActivity } from '../../../../services/statistics/types';
import {
  ACTIVITY_WINDOWS,
  activitySeries,
  sessionsIn,
  type ActivityWindow,
} from '../../data/playerMetrics';
import { StatsCard } from '../StatsCard';

const windowOptions = ACTIVITY_WINDOWS.map((days) => ({
  value: String(days) as `${ActivityWindow}`,
  label: texts.stats.activityWindow(days),
}));

interface ActivityCardProps {
  activity: readonly DailyActivity[];
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [range, setRange] = useState<ActivityWindow>(ACTIVITY_WINDOWS[0]);
  const series = activitySeries(activity, range);
  const caption = texts.stats.activityCaption(sessionsIn(series), range);

  return (
    <StatsCard
      title={texts.stats.activity}
      caption={caption}
      accessory={
        <PillToggle
          options={windowOptions}
          selected={`${range}`}
          onSelect={(value) => setRange(Number(value) as ActivityWindow)}
          raised
        />
      }
    >
      <BarChart data={series} formatValue={formatNumber} accessibilityLabel={caption} />
    </StatsCard>
  );
}
