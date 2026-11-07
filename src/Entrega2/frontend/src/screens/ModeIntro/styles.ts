import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing['8xl']}px ${({ theme }) => theme.spacing['7xl']}px;
`;

export const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const Eyebrow = styled(Text).attrs({
  size: 'sm',
  weight: 'extraBold',
  tone: 'primaryDark',
  tracking: 'wide',
})``;

export const Skip = styled(Text).attrs({ size: 'smPlus', weight: 'extraBold', tone: 'inkSoft' })``;

export const Body = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['4xl']}px;
`;

export const StepBadge = styled.View<{ accent: string }>`
  width: ${({ theme }) => theme.sizes.avatarLarge}px;
  height: ${({ theme }) => theme.sizes.avatarLarge}px;
  border-radius: ${({ theme }) => theme.radii['6xl']}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ accent }) => accent};
`;

export const StepNumber = styled(Text).attrs({ size: '5xl', weight: 'extraBold' })<{
  foreground: string;
}>`
  color: ${({ foreground }) => foreground};
`;

export const StepTitle = styled(Text).attrs({
  size: '4xl',
  weight: 'extraBold',
  align: 'center',
})``;

export const StepDescription = styled(Text).attrs({
  size: 'mdPlus',
  tone: 'inkSoft',
  align: 'center',
  leading: 'relaxed',
})``;

export const Dots = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

export const Dot = styled.View<{ active: boolean }>`
  width: ${({ theme, active }) => (active ? theme.spacing['6xl'] : theme.spacing.sm)}px;
  height: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, active }) => (active ? theme.colors.primaryDark : theme.colors.border)};
`;

export const Actions = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const ActionSlot = styled.View<{ weight: number }>`
  flex: ${({ weight }) => weight};
`;
