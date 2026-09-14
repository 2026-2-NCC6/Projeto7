import { LevelProgressCard } from '../../../../components/LevelProgressCard';
import { EmptyState } from '../../../../components/StateView';
import { texts } from '../../../../content/texts';
import type { PlayerStatistics } from '../../../../services/statistics/types';
import { Section } from '../../styles';
import { hasPlayed, recordItems, summaryTiles } from '../../data/playerMetrics';
import { hasTargetData } from '../../data/wallMetrics';
import { AccuracyTrendCard } from '../AccuracyTrendCard';
import { ActivityCard } from '../ActivityCard';
import { DataList } from '../DataList';
import { ImpactCard } from '../ImpactCard';
import { ModeBreakdownCard } from '../ModeBreakdownCard';
import { RecentSessionsTable } from '../RecentSessionsTable';
import { StatsCard } from '../StatsCard';
import { SummaryGrid } from '../SummaryGrid';
import { WallCard } from '../WallCard';

interface PlayerDashboardProps {
  statistics: PlayerStatistics;
}

export function PlayerDashboard({ statistics }: PlayerDashboardProps) {
  if (!hasPlayed(statistics)) {
    return (
      <>
        <SummaryGrid tiles={summaryTiles(statistics.summary)} />
        <EmptyState title={texts.stats.noSessionsTitle} message={texts.stats.noSessionsMessage} />
      </>
    );
  }

  return (
    <>
      <SummaryGrid tiles={summaryTiles(statistics.summary)} />
      <ActivityCard activity={statistics.activity} />
      <AccuracyTrendCard recentSessions={statistics.recentSessions} />
      {hasTargetData(statistics.targets) ? (
        <WallCard targets={statistics.targets} />
      ) : (
        <StatsCard title={texts.stats.wall} caption={texts.stats.wallEmpty} />
      )}
      <ImpactCard targets={statistics.targets} />
      <ModeBreakdownCard modes={statistics.modes} />
      <RecentSessionsTable sessions={statistics.recentSessions} />
      <StatsCard title={texts.stats.records}>
        <DataList items={recordItems(statistics)} />
      </StatsCard>
      {statistics.progress.length > 0 ? (
        <>
          <Section>{texts.stats.progress}</Section>
          <LevelProgressCard progress={statistics.progress} />
        </>
      ) : null}
    </>
  );
}
