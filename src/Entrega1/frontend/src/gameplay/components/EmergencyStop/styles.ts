import styled from 'styled-components/native';
import { Text } from '../../../components/Text';

export const Floating = styled.View`
  position: absolute;
  right: ${({ theme }) => theme.spacing['5xl']}px;
  bottom: ${({ theme }) => theme.sizes.emergencyButtonOffset}px;
`;

export const StopPill = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.danger};
`;

export const StopMark = styled.View`
  width: ${({ theme }) => theme.sizes.iconSmall}px;
  height: ${({ theme }) => theme.sizes.iconSmall}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ theme }) => theme.colors.onDanger};
`;

export const StopLabel = styled(Text).attrs({ size: 'md', weight: 'extraBold', tracking: 'wide' })`
  color: ${({ theme }) => theme.colors.onDanger};
`;

export const Backdrop = styled.View`
  flex: 1;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.translucentDark};
`;

export const Sheet = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing['7xl']}px ${({ theme }) => theme.spacing['5xl']}px;
  border-top-left-radius: ${({ theme }) => theme.radii['6xl']}px;
  border-top-right-radius: ${({ theme }) => theme.radii['6xl']}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const SheetTitle = styled(Text).attrs({ size: '2xl', weight: 'extraBold' })``;

export const SheetHint = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft' })``;

export const Reason = styled.View`
  padding: ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii['3xl']}px;
  border-width: ${({ theme }) => theme.sizes.inputBorder}px;
  border-color: ${({ theme }) => theme.colors.danger};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

export const ReasonLabel = styled(Text).attrs({ size: 'md', weight: 'bold' })``;
