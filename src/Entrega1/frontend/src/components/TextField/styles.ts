import styled from 'styled-components/native';
import { Text } from '../Text';

export const Field = styled.TextInput<{ focused: boolean; invalid: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing['3xl'] - 1}px ${({ theme }) => theme.spacing['3xl']}px;
  border-radius: ${({ theme }) => theme.radii['2xl']}px;
  border-width: ${({ theme }) => theme.sizes.inputBorder}px;
  border-color: ${({ theme, focused, invalid }) =>
    invalid ? theme.colors.danger : focused ? theme.colors.primaryDark : theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.typography.fontFamily.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  color: ${({ theme }) => theme.colors.ink};
`;

export const ErrorMessage = styled(Text).attrs({ size: 'sm', weight: 'bold', tone: 'danger' })`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-left: ${({ theme }) => theme.spacing.xs}px;
`;
