import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import type { WallTarget } from '../../../device/contracts';
import { CellSlot, CellSurface, CellValue, Pop, PopLabel } from './styles';

const HIT_SCALE = 1.14;
const POP_TRAVEL = -34;
const PULSE_IN_MS = 90;
const POP_MS = 620;

export interface CellPulse {
  readonly seq: number;
  readonly scoreDelta: number;
}

interface TargetCellProps {
  target: WallTarget;
  fill: string;
  foreground: string;
  muted: boolean;
  value: string;
  pulse: CellPulse | null;
  popForeground: string;
}

export function TargetCell({
  fill,
  foreground,
  muted,
  value,
  pulse,
  popForeground,
}: TargetCellProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const popProgress = useRef(new Animated.Value(0)).current;
  const lastSeq = useRef(0);
  const popLabel = useRef('');

  useEffect(() => {
    if (!pulse || pulse.seq === lastSeq.current) {
      return;
    }

    lastSeq.current = pulse.seq;
    popLabel.current =
      pulse.scoreDelta >= 0 ? `+${pulse.scoreDelta}` : `${pulse.scoreDelta}`;

    Animated.sequence([
      Animated.timing(scale, { toValue: HIT_SCALE, duration: PULSE_IN_MS, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 18, useNativeDriver: true }),
    ]).start();

    popProgress.setValue(0);
    Animated.timing(popProgress, {
      toValue: 1,
      duration: POP_MS,
      useNativeDriver: true,
    }).start();
  }, [pulse, scale, popProgress]);

  const popStyle = {
    opacity: popProgress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
    transform: [
      {
        translateY: popProgress.interpolate({ inputRange: [0, 1], outputRange: [0, POP_TRAVEL] }),
      },
    ],
  };

  return (
    <CellSlot>
      <CellSurface fill={fill} muted={muted} style={{ transform: [{ scale }] }}>
        <CellValue foreground={foreground}>{value}</CellValue>
      </CellSurface>
      <Pop style={popStyle} pointerEvents="none">
        <PopLabel foreground={popForeground}>{popLabel.current}</PopLabel>
      </Pop>
    </CellSlot>
  );
}
