import styled from 'styled-components/native';

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  width: ${({ theme }) => theme.sizes.logoCell * 3 + theme.spacing.xs * 2}px;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Cell = styled.View<{ highlighted: boolean }>`
  width: ${({ theme }) => theme.sizes.logoCell}px;
  height: ${({ theme }) => theme.sizes.logoCell}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ theme, highlighted }) =>
    highlighted ? theme.colors.primaryDark : theme.colors.border};
`;
