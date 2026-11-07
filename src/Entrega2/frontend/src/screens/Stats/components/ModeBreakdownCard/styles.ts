import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

export const Rows = styled.View`
  gap: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Row = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const RowHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const Labels = styled.View`
  flex: 1;
`;

export const ModeName = styled(Text).attrs({ size: 'base', weight: 'extraBold' })``;

export const ModeSummary = styled(Text).attrs({ size: 'sm', weight: 'bold', tone: 'inkSoft' })``;

export const Detail = styled(Text).attrs({ size: 'sm', weight: 'extraBold', align: 'right' })`
  flex-shrink: 1;
  max-width: 45%;
`;
