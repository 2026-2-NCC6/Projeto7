import styled from 'styled-components/native';
import { Text } from '../Text';

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Pill = styled.View<{ active: boolean; inactiveBackground: string }>`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, active, inactiveBackground }) =>
    active ? theme.colors.primary : inactiveBackground};
`;

export const PillLabel = styled(Text).attrs<{ active: boolean }>(({ active }) => ({
  size: 'base' as const,
  weight: 'extraBold' as const,
  tone: active ? ('onPrimary' as const) : ('inkSoft' as const),
}))<{ active: boolean }>``;
