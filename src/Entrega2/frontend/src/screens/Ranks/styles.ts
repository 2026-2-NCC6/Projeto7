import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import type { AppTheme } from '../../theme';

export const RowSeparator = styled.View`
  height: ${({ theme }) => theme.spacing.md}px;
`;

export function listContentStyle(theme: AppTheme): StyleProp<ViewStyle> {
  return {
    paddingTop: theme.spacing['6xl'],
    paddingHorizontal: theme.spacing['5xl'],
    paddingBottom: theme.spacing['7xl'],
  };
}
