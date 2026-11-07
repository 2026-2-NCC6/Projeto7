import { texts } from '../../../../content/texts';
import { sensorItems } from '../../data/telemetryItems';
import { DataList } from '../DataList';
import { StatsCard } from '../StatsCard';

export function SensorsCard() {
  return (
    <StatsCard title={texts.stats.sensors} caption={texts.stats.sensorsCaption}>
      <DataList items={sensorItems()} />
    </StatsCard>
  );
}
