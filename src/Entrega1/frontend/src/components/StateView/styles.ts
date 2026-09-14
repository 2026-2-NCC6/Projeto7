import styled from 'styled-components/native';
import { Card } from '../Card';
import { Text } from '../Text';

export const Centered = styled.View`
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['3xl']}px;
  padding: ${({ theme }) => theme.spacing['9xl']}px ${({ theme }) => theme.spacing['5xl']}px;
`;

export const Message = styled(Text).attrs({
  size: 'md',
  weight: 'bold',
  tone: 'inkSoft',
  align: 'center',
  leading: 'normal',
})``;

export const RetryLabel = styled(Text).attrs({
  size: 'md',
  weight: 'extraBold',
  tone: 'primaryDark',
})``;

export const EmptyCard = styled(Card)`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing['7xl']}px ${({ theme }) => theme.spacing['5xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

export const EmptyTitle = styled(Text).attrs({ size: 'lg', weight: 'extraBold', align: 'center' })``;

export const EmptyMessage = styled(Text).attrs({
  size: 'base',
  weight: 'bold',
  tone: 'inkSoft',
  align: 'center',
  leading: 'relaxed',
})``;

export const ActionSlot = styled.View`
  align-self: stretch;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;
