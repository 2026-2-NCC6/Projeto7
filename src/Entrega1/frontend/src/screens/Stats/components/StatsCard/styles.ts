import styled from 'styled-components/native';
import { Card } from '../../../../components/Card';
import { Text } from '../../../../components/Text';

export const Container = styled(Card)`
  padding: ${({ theme }) => theme.spacing['4xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
  gap: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Titles = styled.View`
  flex-shrink: 1;
  gap: ${({ theme }) => theme.spacing.xxs}px;
`;

export const Title = styled(Text).attrs({ size: 'md', weight: 'extraBold' })``;

export const Caption = styled(Text).attrs({
  size: 'sm',
  weight: 'bold',
  tone: 'inkSoft',
  leading: 'normal',
})``;
