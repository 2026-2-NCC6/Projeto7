import styled from 'styled-components/native';
import { Card } from '../../components/Card';
import { Text } from '../../components/Text';

export { Centered, Content } from '../shared/screenStyles';

export const BackAction = styled(Text).attrs({ size: 'base', weight: 'extraBold', tone: 'primaryDark' })`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const Title = styled(Text).attrs({ size: '4xl', weight: 'extraBold' })`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const Subtitle = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft', leading: 'relaxed' })`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Filters = styled.ScrollView.attrs({ horizontal: true, showsHorizontalScrollIndicator: false })`
  flex-grow: 0;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Notice = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft' })`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const List = styled.View`
  gap: ${({ theme }) => theme.spacing['2xl']}px;
`;

export const TrainingCard = styled(Card)`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing['4xl']}px;
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Tag = styled(Text).attrs({ size: 'xs', weight: 'extraBold', tone: 'primaryDark', tracking: 'wide' })``;

export const Name = styled(Text).attrs({ size: 'xl', weight: 'extraBold' })``;

export const Summary = styled(Text).attrs({ size: 'smPlus', tone: 'inkSoft', leading: 'relaxed' })``;

export const Meta = styled(Text).attrs({ size: 'sm', weight: 'bold', tone: 'inkSoft' })``;

export const Dots = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Dot = styled.View<{ fill: string }>`
  width: ${({ theme }) => theme.spacing.lg}px;
  height: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ fill }) => fill};
`;

export const Message = styled(Text).attrs({ size: 'md', weight: 'bold', tone: 'inkSoft', align: 'center' })``;

export const Retry = styled(Text).attrs({ size: 'md', weight: 'extraBold', tone: 'primaryDark' })``;
