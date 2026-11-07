import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export { Content } from '../shared/screenStyles';

export const Header = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing['5xl']}px;
`;

export const Title = styled(Text).attrs({ size: '4xl', weight: 'extraBold' })`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const Progress = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft' })`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const Grid = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const GridRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const BandTitle = styled(Text).attrs({
  size: 'xs',
  weight: 'extraBold',
  tone: 'inkSoft',
  tracking: 'wide',
})`
  margin-top: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const BackAction = styled(Text).attrs({
  size: 'base',
  weight: 'extraBold',
  tone: 'primaryDark',
})`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;
