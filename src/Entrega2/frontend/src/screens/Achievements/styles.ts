import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export { Content } from '../shared/screenStyles';
export { Diamond } from '../../components/Diamond';

export const BackRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing['5xl']}px;
`;

export const BackLabel = styled(Text).attrs({
  size: 'base',
  weight: 'extraBold',
  tone: 'inkSoft',
})``;

export const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const Title = styled(Text).attrs({ size: '4xl', weight: 'extraBold' })``;

export const Counter = styled(Text).attrs({
  size: 'base',
  weight: 'bold',
  tone: 'inkSoft',
})`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Overall = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing['5xl']}px;
`;

export const Filters = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing['5xl']}px;
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const EmptyMessage = styled(Text).attrs({
  size: 'md',
  weight: 'bold',
  tone: 'inkSoft',
  align: 'center',
})`
  padding-top: ${({ theme }) => theme.spacing['7xl']}px;
`;
