import styled from 'styled-components/native';
import { BrandName } from '../shared/authStyles';
import { Text } from '../../components/Text';

export const LogoRow = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const Brand = styled(BrandName)`
  margin-bottom: ${({ theme }) => theme.spacing['9xl']}px;
`;

export const Intro = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing['8xl']}px;
`;

export const Fields = styled.View`
  gap: ${({ theme }) => theme.spacing['2xl']}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

export const TermsNotice = styled(Text).attrs({
  size: 'sm',
  tone: 'inkSoft',
  align: 'center',
  leading: 'relaxed',
})`
  padding-top: ${({ theme }) => theme.spacing['3xl']}px;
`;
