import type { ReactElement } from 'react';
import { useTheme } from 'styled-components/native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'sequence'
  | 'target'
  | 'infinite'
  | 'timer'
  | 'flame'
  | 'medal'
  | 'trophy'
  | 'crown'
  | 'calendar'
  | 'crosshair'
  | 'bolt';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  filled?: boolean;
}

const VIEW_BOX = 24;
const STROKE = 2;

const CROWN_PATH = 'M3 7 L6.5 11.5 L12 5.5 L17.5 11.5 L21 7 L19.5 18.5 H4.5 Z';

const TROPHY_CUP_PATH = 'M7 3 h10 v4 a5 5 0 0 1 -10 0 z';

const BOLT_PATH = 'M13.6 1.8 L4.4 13.6 h6.1 L10 22.2 L19.6 10 h-6.6 z';

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

  medal: (color) => (
    <>
      <Path
        d="M7.2 2 L9.8 8.2 M16.8 2 L14.2 8.2"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={12} cy={15} r={6.4} stroke={color} strokeWidth={STROKE} fill="none" />
      <Circle cx={12} cy={15} r={2.6} fill={color} />
    </>
  ),

  trophy: (color) => (
    <>
      <Path d={TROPHY_CUP_PATH} fill={color} />
      <Path
        d="M7 4 H4.4 a2.6 2.6 0 0 0 2.8 4.2 M17 4 H19.6 a2.6 2.6 0 0 1 -2.8 4.2"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={10.8} y={12} width={2.4} height={4.4} fill={color} />
      <Rect x={7.4} y={18} width={9.2} height={2.6} rx={1.3} fill={color} />
    </>
  ),

  crown: (color) => <Path d={CROWN_PATH} fill={color} strokeLinejoin="round" />,

  calendar: (color) => (
    <>
      <Rect x={3} y={4.6} width={18} height={16.4} rx={3.2} stroke={color} strokeWidth={STROKE} fill="none" />
      <Line x1={3} y1={10} x2={21} y2={10} stroke={color} strokeWidth={STROKE} />
      <Line x1={8} y1={2.4} x2={8} y2={6.4} stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Line x1={16} y1={2.4} x2={16} y2={6.4} stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Circle cx={8.4} cy={14.8} r={1.4} fill={color} />
      <Circle cx={12} cy={14.8} r={1.4} fill={color} />
      <Circle cx={15.6} cy={14.8} r={1.4} fill={color} />
    </>
  ),

  crosshair: (color) => (
    <>
      <Circle cx={12} cy={12} r={7.4} stroke={color} strokeWidth={STROKE} fill="none" />
      <Path
        d="M12 1.6 V5 M12 19 V22.4 M1.6 12 H5 M19 12 H22.4"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={12} r={2.4} fill={color} />
    </>
  ),

  bolt: (color) => <Path d={BOLT_PATH} fill={color} strokeLinejoin="round" />,
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
