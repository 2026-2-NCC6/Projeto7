import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';

const PULSE_MS = 1600;
const PULSE_SCALE = 1.18;

const Ring = styled(Animated.View)<{ fill: string; outline: string }>`
  width: ${({ theme }) => theme.sizes.promptRing}px;
  height: ${({ theme }) => theme.sizes.promptRing}px;
  border-radius: ${({ theme }) => theme.radii['6xl'] + theme.spacing.md}px;
  background-color: ${({ fill }) => fill};
  border-width: ${({ theme }) => theme.sizes.promptRingBorder}px;
  border-color: ${({ outline }) => outline};
`;

interface PromptRingProps {
  fill: string;
  outline: string;
  pulsing: boolean;
}

export function PromptRing({ fill, outline, pulsing }: PromptRingProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulsing) {
      pulse.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: PULSE_MS / 2, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: PULSE_MS / 2, useNativeDriver: true }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulsing, pulse]);

  const style = {
    transform: [
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, PULSE_SCALE] }) },
    ],
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] }),
  };

  return <Ring fill={fill} outline={outline} style={style} />;
}
