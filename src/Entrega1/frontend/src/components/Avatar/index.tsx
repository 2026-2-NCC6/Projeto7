import { useTheme } from 'styled-components/native';
import type { FontSizeToken } from '../../theme';
import { Circle, Initial } from './styles';

interface AvatarProps {
  name: string;
  diameter?: number;
  fontSize?: FontSizeToken;
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function Avatar({ name, diameter, fontSize = 'lg' }: AvatarProps) {
  const theme = useTheme();

  return (
    <Circle diameter={diameter ?? theme.sizes.avatar}>
      <Initial size={fontSize}>{initialOf(name)}</Initial>
    </Circle>
  );
}
