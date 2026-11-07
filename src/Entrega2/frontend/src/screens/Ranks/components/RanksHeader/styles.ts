import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

export const Title = styled(Text).attrs({ size: '4xl', weight: 'extraBold' })`
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const Subtitle = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft' })`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Description = styled(Text).attrs({
  size: 'smPlus',
  weight: 'bold',
  tone: 'inkSoft',
  leading: 'normal',
})`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;
