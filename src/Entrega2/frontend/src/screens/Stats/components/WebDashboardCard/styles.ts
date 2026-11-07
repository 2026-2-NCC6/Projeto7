import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

export const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing['4xl']}px;
  border-radius: ${({ theme }) => theme.radii['4xl']}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

export const Title = styled(Text).attrs({ size: 'lg', weight: 'extraBold' })``;

export const Message = styled(Text).attrs({
  size: 'base',
  weight: 'bold',
  tone: 'inkSoft',
  leading: 'relaxed',
})``;

export const Soon = styled(Text).attrs({
  size: 'xs',
  weight: 'extraBold',
  tone: 'primaryDark',
  tracking: 'wide',
  align: 'center',
})``;
