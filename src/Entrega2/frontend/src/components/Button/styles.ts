import styled, { css } from 'styled-components/native';
import { Text } from '../Text';

export type ButtonVariant = 'primary' | 'outline';

export const Container = styled.View<{ variant: ButtonVariant; disabled: boolean }>`
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  ${({ theme, variant }) =>
    variant === 'primary'
      ? css`
          padding: ${theme.spacing['4xl'] - 1}px;
          background-color: ${theme.colors.primary};
        `
      : css`
          padding: ${theme.spacing['3xl']}px;
          background-color: ${theme.colors.surfaceRaised};
          border-width: ${theme.sizes.inputBorder}px;
          border-color: ${theme.colors.border};
        `}
`;

export const Label = styled(Text).attrs<{ variant: ButtonVariant }>(({ variant }) => ({
  size: variant === 'primary' ? 'xl' : 'lg',
  weight: variant === 'primary' ? 'extraBold' : 'bold',
  tone: variant === 'primary' ? 'onPrimary' : 'ink',
}))<{ variant: ButtonVariant }>``;
