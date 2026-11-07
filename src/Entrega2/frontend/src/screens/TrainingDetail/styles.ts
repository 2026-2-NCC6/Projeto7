import styled from 'styled-components/native';
import { Card } from '../../components/Card';
import { Text } from '../../components/Text';

export { BackAction, Centered, Content, Message, Retry, Subtitle, Title, Notice } from '../TrainingCatalog/styles';

export const Block = styled(Card)`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing['4xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const BlockTitle = styled(Text).attrs({ size: 'xs', weight: 'extraBold', tone: 'inkSoft', tracking: 'wide' })``;

export const Body = styled(Text).attrs({ size: 'md', leading: 'relaxed' })``;

export const Item = styled(Text).attrs({ size: 'md', leading: 'relaxed' })``;

export const StepCard = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii['2xl']}px;
  border-left-width: ${({ theme }) => theme.sizes.avatarRing}px;
  border-left-color: ${({ theme }) => theme.colors.primaryDark};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

export const StepName = styled(Text).attrs({ size: 'lg', weight: 'extraBold' })``;

export const StepRule = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft' })``;

export const Safety = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft', leading: 'relaxed' })`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Actions = styled.View`
  padding: ${({ theme }) => theme.spacing['5xl']}px;
  gap: ${({ theme }) => theme.spacing.xl}px;
`;
