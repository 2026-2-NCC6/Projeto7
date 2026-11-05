import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export { BackAction, Centered, Content, Message, Retry, Subtitle, Title } from '../TrainingCatalog/styles';

export const Field = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Label = styled(Text).attrs({ size: 'xs', weight: 'extraBold', tone: 'inkSoft', tracking: 'wide' })``;

export const Chips = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Chip = styled.View<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.surface)};
`;

export const ChipLabel = styled(Text).attrs<{ active: boolean }>(({ active }) => ({
  size: 'base' as const,
  weight: 'extraBold' as const,
  tone: active ? ('onPrimary' as const) : ('inkSoft' as const),
}))<{ active: boolean }>``;

export const Notice = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'inkSoft', leading: 'relaxed' })`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']}px;
`;

export const Status = styled(Text).attrs({ size: 'smPlus', weight: 'extraBold', tone: 'primaryDark', align: 'center' })``;

export const ErrorText = styled(Text).attrs({ size: 'smPlus', weight: 'bold', tone: 'danger', align: 'center' })``;

export const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing['9xl']}px;
`;
