import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

export type PodiumPlace = 1 | 2 | 3;

export const Row = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing['7xl']}px;
`;

export const Column = styled.View`
  flex: 1;
  max-width: ${({ theme }) => theme.sizes.podiumColumnWidth}px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Ring = styled.View<{ place: PodiumPlace }>`
  border-width: ${({ theme }) => theme.sizes.avatarRing}px;
  border-radius: ${({ theme }) => theme.sizes.podiumAvatarLeader}px;
  border-color: ${({ theme, place }) =>
    place === 1
      ? theme.colors.primary
      : place === 2
        ? theme.colors.tier.silver.background
        : theme.colors.tier.bronze.background};
`;

export const Name = styled(Text).attrs({ size: 'sm', weight: 'extraBold', align: 'center' })`
  align-self: stretch;
`;

export const Value = styled(Text).attrs({
  size: '2xs',
  weight: 'bold',
  tone: 'inkSoft',
  align: 'center',
})`
  align-self: stretch;
`;

export const Step = styled.View<{ place: PodiumPlace }>`
  align-self: stretch;
  align-items: center;
  justify-content: center;
  height: ${({ theme, place }) =>
    place === 1
      ? theme.sizes.podiumStepLeader
      : place === 2
        ? theme.sizes.podiumStepSecond
        : theme.sizes.podiumStepThird}px;
  border-top-left-radius: ${({ theme }) => theme.radii['2xl']}px;
  border-top-right-radius: ${({ theme }) => theme.radii['2xl']}px;
  background-color: ${({ theme, place }) =>
    place === 1 ? theme.colors.primarySoft : theme.colors.surface};
`;

export const StepNumber = styled(Text).attrs<{ place: PodiumPlace }>(({ place }) => ({
  size: place === 1 ? ('4xl' as const) : ('2xl' as const),
  weight: 'extraBold' as const,
  tone: place === 1 ? ('primaryDark' as const) : ('inkSoft' as const),
}))<{ place: PodiumPlace }>``;
