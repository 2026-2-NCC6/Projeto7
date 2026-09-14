import { Button } from '../../../../components/Button';
import { texts } from '../../../../content/texts';
import { deviceConfig } from '../../../../device/config';
import { useDevice } from '../../../../device/runtime/useDevice';
import { canReconnect, deviceItems } from '../../data/telemetryItems';
import { DataList } from '../DataList';
import { StatsCard } from '../StatsCard';
import { ActionSlot } from './styles';

export function DeviceCard() {
  const { device, status, telemetry, lastFault, reconnect } = useDevice();
  const items = deviceItems({
    descriptor: device.descriptor,
    status,
    telemetry,
    lastFault,
    wallUrl: deviceConfig.wallUrl,
  });

  return (
    <StatsCard title={texts.stats.device}>
      <DataList items={items} />
      {canReconnect(status) ? (
        <ActionSlot>
          <Button label={texts.stats.reconnect} variant="outline" onPress={reconnect} />
        </ActionSlot>
      ) : null}
    </StatsCard>
  );
}
