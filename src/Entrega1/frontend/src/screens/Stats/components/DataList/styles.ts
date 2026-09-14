import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';
import type { DataIndicator } from '../../data/dataItem';

export const List = styled.View``;

export const Row = styled.View<{ divided: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px 0;
  border-top-width: ${({ theme, divided }) => (divided ? theme.sizes.hairline : 0)}px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

export const Label = styled(Text).attrs({ size: 'base', weight: 'bold', tone: 'inkSoft' })`
  flex: 1;
`;

export const ValueGroup = styled.View`
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  max-width: 60%;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Value = styled(Text).attrs<{ missing: boolean }>(({ missing }) => ({
  size: 'base' as const,
  weight: missing ? ('bold' as const) : ('extraBold' as const),
  tone: missing ? ('inkSoft' as const) : ('ink' as const),
  align: 'right' as const,
}))<{ missing: boolean }>`
  flex-shrink: 1;
`;

export const Indicator = styled.View<{ indicator: DataIndicator }>`
  width: ${({ theme }) => theme.sizes.statusDot}px;
  height: ${({ theme }) => theme.sizes.statusDot}px;
  border-radius: ${({ theme }) => theme.sizes.statusDot / 2}px;
  background-color: ${({ theme, indicator }) =>
    indicator === 'positive'
      ? theme.colors.primaryDark
      : indicator === 'warning'
        ? theme.colors.target.amber.background
        : theme.colors.danger};
`;
