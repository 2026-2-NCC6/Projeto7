import styled from 'styled-components/native';
import { Text } from '../../Text';

export const Container = styled.View`
  width: 100%;
`;

export const Plot = styled.View`
  width: 100%;
  height: ${({ theme }) => theme.sizes.chartHeight}px;
`;

export const ScaleLabel = styled(Text).attrs({ size: '2xs', weight: 'bold', tone: 'inkSoft' })`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const AxisRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const AxisLabel = styled(Text).attrs({ size: '2xs', weight: 'bold', tone: 'inkSoft' })``;
