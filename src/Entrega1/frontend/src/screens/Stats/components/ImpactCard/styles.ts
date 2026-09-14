import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

export const Rows = styled.View`
  gap: ${({ theme }) => theme.spacing['2xl']}px;
`;

export const Row = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const RowHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Swatch = styled.View<{ color: string }>`
  width: ${({ theme }) => theme.sizes.swatch}px;
  height: ${({ theme }) => theme.sizes.swatch}px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ color }) => color};
`;

export const TargetName = styled(Text).attrs({ size: 'base', weight: 'extraBold' })``;

export const Reading = styled(Text).attrs({ size: 'sm', weight: 'bold', tone: 'inkSoft', align: 'right' })`
  flex: 1;
`;

export const Waiting = styled(Text).attrs({ size: 'base', weight: 'bold', tone: 'inkSoft' })``;
