import styled from 'styled-components/native';
import { Text } from '../../../components/Text';

export const Dock = styled.View`
  position: absolute;
  right: ${({ theme }) => theme.spacing.lg}px;
  bottom: ${({ theme }) => theme.spacing['9xl']}px;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Panel = styled.View`
  padding: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.radii['3xl']}px;
  background-color: ${({ theme }) => theme.colors.ink};
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  width: ${({ theme }) => theme.sizes.badge * 3 + theme.spacing.xs * 2}px;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Cell = styled.View<{ fill: string }>`
  width: ${({ theme }) => theme.sizes.badge}px;
  height: ${({ theme }) => theme.sizes.badge}px;
  border-radius: ${({ theme }) => theme.radii.lg}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ fill }) => fill};
`;

export const CellLabel = styled(Text).attrs({ size: 'sm', weight: 'extraBold' })<{
  foreground: string;
}>`
  color: ${({ foreground }) => foreground};
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const Chip = styled.View<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.inkSoft)};
`;

export const ChipLabel = styled(Text).attrs({ size: 'xs', weight: 'extraBold' })<{
  active: boolean;
}>`
  color: ${({ theme, active }) => (active ? theme.colors.onPrimary : theme.colors.onInk)};
`;

export const Toggle = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const ToggleLabel = styled(Text).attrs({ size: 'xs', weight: 'extraBold' })`
  color: ${({ theme }) => theme.colors.onInk};
`;
