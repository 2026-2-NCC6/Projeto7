import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { Text } from '../../../components/Text';

export const Grid = styled.View`
  width: 100%;
  max-width: ${({ theme }) => theme.sizes.targetGridMaxWidth}px;
  align-self: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const GridRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const CellSlot = styled.View`
  flex: 1;
  aspect-ratio: 1;
`;

export const CellSurface = styled(Animated.View)<{ fill: string; muted: boolean }>`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii['3xl']}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ fill }) => fill};
  opacity: ${({ muted }) => (muted ? 0.28 : 1)};
`;

export const CellValue = styled(Text).attrs({ size: 'md', weight: 'extraBold' })<{
  foreground: string;
}>`
  color: ${({ foreground }) => foreground};
`;

export const Pop = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  align-items: center;
`;

export const PopLabel = styled(Text).attrs({ size: '2xl', weight: 'extraBold' })<{
  foreground: string;
}>`
  color: ${({ foreground }) => foreground};
`;
