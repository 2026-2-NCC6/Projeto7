import styled, { css } from 'styled-components/native';
import type { FontSizeToken, FontWeightToken, LineHeightToken } from '../../theme';

export type TextTone =
  | 'ink'
  | 'inkSoft'
  | 'onPrimary'
  | 'primary'
  | 'primaryDark'
  | 'danger';

export interface TextProps {
  size?: FontSizeToken;
  weight?: FontWeightToken;
  tone?: TextTone;
  leading?: LineHeightToken;
  tracking?: 'none' | 'wide' | 'wider';
  align?: 'left' | 'center' | 'right';
}

const toneColor = {
  ink: (t: { colors: { ink: string } }) => t.colors.ink,
  inkSoft: (t: { colors: { inkSoft: string } }) => t.colors.inkSoft,
  onPrimary: (t: { colors: { onPrimary: string } }) => t.colors.onPrimary,
  primary: (t: { colors: { primary: string } }) => t.colors.primary,
  primaryDark: (t: { colors: { primaryDark: string } }) => t.colors.primaryDark,
  danger: (t: { colors: { danger: string } }) => t.colors.danger,
};

export const Text = styled.Text<TextProps>`
  ${({ theme, size = 'md', weight = 'medium', tone = 'ink', leading, tracking = 'none', align }) => css`
    font-family: ${theme.typography.fontFamily[weight]};
    font-size: ${theme.typography.fontSize[size]}px;
    color: ${toneColor[tone](theme)};
    letter-spacing: ${theme.typography.letterSpacing[tracking]}px;
    ${leading
      ? css`
          line-height: ${theme.typography.fontSize[size] * theme.typography.lineHeightRatio[leading]}px;
        `
      : ''}
    ${align ? css`text-align: ${align};` : ''}
  `}
`;
