import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing['9xl']}px ${({ theme }) => theme.spacing['8xl']}px
    ${({ theme }) => theme.spacing['7xl']}px;
`;

export const Badge = styled.View<{ fill: string }>`
  width: ${({ theme }) => theme.sizes.avatarLarge}px;
  height: ${({ theme }) => theme.sizes.avatarLarge}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  align-self: center;
  align-items: center;
  justify-content: center;
  background-color: ${({ fill }) => fill};
  margin-bottom: ${({ theme }) => theme.spacing['4xl']}px;
`;

export const BadgeMark = styled(Text).attrs({ size: '5xl', weight: 'extraBold' })<{
  foreground: string;
}>`
  color: ${({ foreground }) => foreground};
`;

export const Title = styled(Text).attrs({ size: '4xl', weight: 'extraBold', align: 'center' })`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const Subtitle = styled(Text).attrs({
  size: 'md',
  weight: 'bold',
  tone: 'inkSoft',
  align: 'center',
})`
  margin-bottom: ${({ theme }) => theme.spacing['7xl']}px;
`;

export const RewardPill = styled.View`
  align-self: center;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing['4xl']}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  margin-bottom: ${({ theme }) => theme.spacing['4xl']}px;
`;

export const RewardLabel = styled(Text).attrs({
  size: 'md',
  weight: 'extraBold',
  tone: 'primaryDark',
})``;

export const Notice = styled(Text).attrs({
  size: 'smPlus',
  tone: 'inkSoft',
  align: 'center',
  leading: 'relaxed',
})`
  margin-top: ${({ theme }) => theme.spacing['4xl']}px;
`;

export const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
  padding-top: ${({ theme }) => theme.spacing['7xl']}px;
`;

export const Scroll = styled.ScrollView.attrs(({ theme }) => ({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: { paddingBottom: theme.spacing['5xl'] },
}))`
  flex: 1;
`;
