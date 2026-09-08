import styled from 'styled-components/native';
import { Card } from '../../../components/Card';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';
import type { ProfileRecords } from '../../../services/profile/types';

const List = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

const Row = styled(Card)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii['3xl']}px;
`;

const Label = styled(Text).attrs({ size: 'md', weight: 'bold', tone: 'inkSoft' })``;

const Value = styled(Text).attrs({ size: 'lg', weight: 'extraBold' })``;

interface RecordRow {
  label: string;
  value: string;
}

function rowsOf(records: ProfileRecords): RecordRow[] {
  return [
    {
      label: texts.profile.bestScore,
      value:
        records.bestScore === null
          ? texts.profile.empty
          : records.bestScore.toLocaleString('pt-BR'),
    },
    {
      label: texts.profile.fastestLevel,
      value:
        records.fastestLevelMs === null
          ? texts.profile.empty
          : texts.profile.durationValue(records.fastestLevelMs),
    },
    {
      label: texts.profile.longestHitStreak,
      value:
        records.longestHitStreak === null
          ? texts.profile.empty
          : String(records.longestHitStreak),
    },
  ];
}

interface PersonalRecordsProps {
  records: ProfileRecords;
}

export function PersonalRecords({ records }: PersonalRecordsProps) {
  return (
    <List>
      {rowsOf(records).map((row) => (
        <Row key={row.label}>
          <Label>{row.label}</Label>
          <Value>{row.value}</Value>
        </Row>
      ))}
    </List>
  );
}
