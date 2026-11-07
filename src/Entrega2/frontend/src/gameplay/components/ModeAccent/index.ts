import type { AppTheme, ColorPair } from '../../../theme';
import type { ModeAccent } from '../../modes/mode-catalog';

export function accentPairOf(theme: AppTheme, accent: ModeAccent): ColorPair {
  if (accent === 'primary') {
    return { background: theme.colors.primary, foreground: theme.colors.onPrimary };
  }

  if (accent === 'ink') {
    return { background: theme.colors.ink, foreground: theme.colors.onInk };
  }

  return theme.colors.target[accent];
}
