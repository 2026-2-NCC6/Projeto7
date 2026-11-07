import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { env } from '../../../../config/env';
import { texts } from '../../../../content/texts';
import { systemItems } from '../../data/telemetryItems';
import { DataList } from '../DataList';
import { StatsCard } from '../StatsCard';

export function SystemCard() {
  const items = systemItems({
    appVersion: Constants.expoConfig?.version ?? null,
    platform: `${Platform.OS} ${Platform.Version}`,
    apiBaseUrl: env.apiBaseUrl,
    isDevelopment: __DEV__,
  });

  return (
    <StatsCard title={texts.stats.system}>
      <DataList items={items} />
    </StatsCard>
  );
}
