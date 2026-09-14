import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

export const Row = styled.View<{ highlighted: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing['2xl']}px;
  border-radius: ${({ theme }) => theme.radii['3xl']}px;
  background-color: ${({ theme, highlighted }) =>
    highlighted ? theme.colors.primarySoft : theme.colors.surface};
`;

export const Position = styled(Text).attrs({
  size: 'md',
  weight: 'extraBold',
  tone: 'inkSoft',
  align: 'center',
})`
  min-width: ${({ theme }) => theme.sizes.rankColumn}px;
`;

export const Identity = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Name = styled(Text).attrs({ size: 'md', weight: 'bold' })`
  flex-shrink: 1;
`;

export const YouTag = styled.View`
  padding: ${({ theme }) => theme.spacing.xxs}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const YouLabel = styled(Text).attrs({ size: '2xs', weight: 'extraBold', tone: 'onPrimary' })``;

export const Value = styled(Text).attrs({ size: 'md', weight: 'extraBold', align: 'right' })`
  flex-shrink: 0;
  max-width: 40%;
`;
