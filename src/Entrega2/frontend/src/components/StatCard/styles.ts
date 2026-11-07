import styled from 'styled-components/native';
import { Card } from '../Card';
import { Text } from '../Text';

export const Container = styled(Card)`
  flex: 1;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii['3xl']}px;
  padding: ${({ theme }) => theme.spacing['2xl']}px ${({ theme }) => theme.spacing.lg}px;
`;

export const Value = styled(Text).attrs({ size: '2xl', weight: 'extraBold' })``;

export const Label = styled(Text).attrs({ size: 'xs', weight: 'bold', tone: 'inkSoft' })`
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;
