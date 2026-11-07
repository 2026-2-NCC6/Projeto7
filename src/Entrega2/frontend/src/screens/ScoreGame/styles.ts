import styled from 'styled-components/native';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';

export const Stage = styled(Screen)`
  flex: 1;
`;

export const Body = styled.View`
  flex: 1;
  padding: 0 ${({ theme }) => theme.spacing['5xl']}px ${({ theme }) => theme.spacing['8xl']}px;
  gap: ${({ theme }) => theme.spacing['4xl']}px;
`;

export const ScoreBlock = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ScoreValue = styled(Text).attrs({ size: '5xl', weight: 'extraBold' })<{
  foreground: string;
}>`
  color: ${({ foreground }) => foreground};
`;

export const ScoreGoal = styled(Text).attrs({
  size: 'base',
  weight: 'extraBold',
  tone: 'inkSoft',
  align: 'center',
})``;

export const Legend = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const LegendItem = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Swatch = styled.View<{ fill: string; muted: boolean }>`
  width: ${({ theme }) => theme.sizes.legendSwatch}px;
  height: ${({ theme }) => theme.sizes.legendSwatch}px;
  border-radius: ${({ theme }) => theme.radii.lg}px;
  background-color: ${({ fill }) => fill};
  opacity: ${({ muted }) => (muted ? 0.28 : 1)};
`;

export const LegendValue = styled(Text).attrs({ size: 'sm', weight: 'extraBold', tone: 'inkSoft' })``;

export const GridArea = styled.View`
  flex: 1;
  justify-content: center;
`;

export const StatusRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const StatusNote = styled(Text).attrs({
  size: 'smPlus',
  weight: 'extraBold',
  tone: 'inkSoft',
})``;

export const TimeLabel = styled(Text).attrs({
  size: 'xs',
  weight: 'extraBold',
  tone: 'inkSoft',
  tracking: 'wide',
})`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;
