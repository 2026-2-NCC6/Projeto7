import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export const BrandRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const Intro = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing['7xl'] + theme.spacing.xs}px;
`;

export const Fields = styled.View`
  gap: ${({ theme }) => theme.spacing['2xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const ForgotPasswordRow = styled.View`
  align-items: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

export const ForgotPasswordLabel = styled(Text).attrs({
  size: 'base',
  weight: 'bold',
  tone: 'inkSoft',
})``;

export const GuestSpacing = styled.View`
  margin: ${({ theme }) => theme.spacing['8xl']}px 0;
`;
