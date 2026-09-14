import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

export const Dock = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing['5xl']}px;
  border-top-width: ${({ theme }) => theme.sizes.hairline}px;
  border-top-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Eyebrow = styled(Text).attrs({
  size: 'xs',
  weight: 'extraBold',
  tone: 'primaryDark',
  tracking: 'wide',
})``;

export const Standing = styled(Text).attrs({ size: 'xs', weight: 'bold', tone: 'inkSoft' })`
  flex-shrink: 1;
`;
