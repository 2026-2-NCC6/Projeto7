import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';

const Track = styled.View<{ trackColor: string; thickness?: number }>`
  width: 100%;
  height: ${({ theme, thickness }) => thickness ?? theme.sizes.progressBar}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ trackColor }) => trackColor};
  overflow: hidden;
`;

const Fill = styled(Animated.View)<{ fillColor: string }>`
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ fillColor }) => fillColor};
`;

const FULL_PERCENT = 100;
const FILL_DURATION_MS = 220;

interface MeterBarProps {
  percentage: number;
  fillColor: string;
  trackColor: string;
  thickness?: number;
  animated?: boolean;
}

export function MeterBar({
  percentage,
  fillColor,
  trackColor,
  thickness,
  animated = true,
}: MeterBarProps) {
  const clamped = Math.max(0, Math.min(FULL_PERCENT, percentage));
  const width = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    if (!animated) {
      width.setValue(clamped);
      return;
    }

    Animated.timing(width, {
      toValue: clamped,
      duration: FILL_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [clamped, animated, width]);

  const style = {
    width: width.interpolate({
      inputRange: [0, FULL_PERCENT],
      outputRange: ['0%', '100%'],
    }),
  };

  return (
    <Track trackColor={trackColor} thickness={thickness}>
      <Fill fillColor={fillColor} style={style} />
    </Track>
  );
}
