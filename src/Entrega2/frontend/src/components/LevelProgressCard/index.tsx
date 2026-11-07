import styled from 'styled-components/native';
import { trackLabels } from '../../content/gameLabels';
import { texts } from '../../content/texts';
import type { TrackProgress } from '../../services/home/types';
import { Card } from '../Card';
import { ProgressFill, ProgressTrack } from '../ProgressBar';
import { Text } from '../Text';

const Container = styled(Card)`
  padding: ${({ theme }) => theme.spacing['4xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
  gap: ${({ theme }) => theme.spacing['4xl']}px;
`;

const Row = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
`;

const Title = styled(Text).attrs({ size: 'md', weight: 'extraBold' })``;

const Counter = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft' })``;

const PERCENT = 100;

function percentageOf({ xp, xpRequired }: TrackProgress): number {
  return xpRequired > 0 ? Math.min(PERCENT, Math.round((xp / xpRequired) * PERCENT)) : 0;
}

interface LevelProgressCardProps {
  progress: TrackProgress[];
}

export function LevelProgressCard({ progress }: LevelProgressCardProps) {
  return (
    <Container>
      {progress.map((item) => (
        <Row key={item.track}>
          <Header>
            <Title>
              {trackLabels[item.track]} · {texts.home.level(item.level)}
            </Title>
            <Counter>{texts.home.xpCounter(item.xp, item.xpRequired)}</Counter>
          </Header>
          <ProgressTrack>
            <ProgressFill percentage={percentageOf(item)} />
          </ProgressTrack>
        </Row>
      ))}
    </Container>
  );
}
