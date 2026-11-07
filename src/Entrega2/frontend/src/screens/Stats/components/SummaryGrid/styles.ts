import styled from 'styled-components/native';

export const Grid = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

export const GridRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;
