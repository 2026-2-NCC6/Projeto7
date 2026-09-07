import type { ReactElement } from 'react';
import { useTheme } from 'styled-components/native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type IconName = 'sequence' | 'target' | 'infinite' | 'timer' | 'flame';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  filled?: boolean;
}

const VIEW_BOX = 24;
const STROKE = 2;

const FLAME_PATH =
  'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 ' +
  '.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';

const shapes: Record<IconName, (color: string, filled: boolean) => ReactElement> = {
  sequence: (color) => (
    <>
      <Rect x={2} y={8} width={6} height={8} rx={2} fill={color} />
      <Rect x={9} y={8} width={6} height={8} rx={2} fill={color} opacity={0.62} />
      <Rect x={16} y={8} width={6} height={8} rx={2} fill={color} opacity={0.32} />
    </>
  ),

  target: (color) => (
    <>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={STROKE} fill="none" />
      <Circle cx={12} cy={12} r={3.6} fill={color} />
    </>
  ),

  infinite: (color) => (
    <>
      <Circle cx={7.4} cy={12} r={4.7} stroke={color} strokeWidth={STROKE} fill="none" />
      <Circle cx={16.6} cy={12} r={4.7} stroke={color} strokeWidth={STROKE} fill="none" />
    </>
  ),

  timer: (color) => (
    <>
      <Circle cx={12} cy={14} r={7.4} stroke={color} strokeWidth={STROKE} fill="none" />
      <Line
        x1={12}
        y1={14}
        x2={12}
        y2={9.5}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Line
        x1={9.3}
        y1={2.4}
        x2={14.7}
        y2={2.4}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Line x1={12} y1={2.4} x2={12} y2={6.2} stroke={color} strokeWidth={STROKE} />
    </>
  ),

  flame: (color, filled) => (
    <Path
      d={FLAME_PATH}
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
};

export function Icon({ name, size, color, filled = true }: IconProps) {
  const theme = useTheme();
  const dimension = size ?? theme.sizes.icon;

  return (
    <Svg width={dimension} height={dimension} viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}>
      {shapes[name](color, filled)}
    </Svg>
  );
}
