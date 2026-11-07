import { texts } from '../../../../content/texts';
import type { RecentSession } from '../../../../services/statistics/types';
import { recentSessionRows } from '../../data/playerMetrics';
import { StatsCard } from '../StatsCard';
import {
  BodyRow,
  DateLabel,
  HeaderLabel,
  HeaderRow,
  ModeLabel,
  NumberColumn,
  NumberLabel,
  SessionColumn,
  Table,
} from './styles';

interface RecentSessionsTableProps {
  sessions: readonly RecentSession[];
}

export function RecentSessionsTable({ sessions }: RecentSessionsTableProps) {
  return (
    <StatsCard title={texts.stats.recentSessions}>
      <Table>
        <HeaderRow>
          <SessionColumn>
            <HeaderLabel numberOfLines={1} adjustsFontSizeToFit>
              {texts.stats.table.mode.toUpperCase()}
            </HeaderLabel>
          </SessionColumn>
          <NumberColumn>
            <HeaderLabel numberOfLines={1} adjustsFontSizeToFit>
              {texts.stats.table.score.toUpperCase()}
            </HeaderLabel>
          </NumberColumn>
          <NumberColumn>
            <HeaderLabel numberOfLines={1} adjustsFontSizeToFit>
              {texts.stats.table.accuracy.toUpperCase()}
            </HeaderLabel>
          </NumberColumn>
        </HeaderRow>
        {recentSessionRows(sessions).map((row) => (
          <BodyRow key={row.id} testID="recent-session">
            <SessionColumn>
              <ModeLabel>{row.mode}</ModeLabel>
              <DateLabel>{row.playedAt}</DateLabel>
            </SessionColumn>
            <NumberColumn>
              <NumberLabel numberOfLines={1} adjustsFontSizeToFit>
                {row.score}
              </NumberLabel>
            </NumberColumn>
            <NumberColumn>
              <NumberLabel numberOfLines={1}>{row.accuracy}</NumberLabel>
            </NumberColumn>
          </BodyRow>
        ))}
      </Table>
    </StatsCard>
  );
}
