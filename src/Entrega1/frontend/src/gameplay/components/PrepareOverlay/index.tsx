import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';

const MS_PER_SECOND = 1000;

const Layer = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
`;

const Count = styled(Animated.Text)<{ foreground: string }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.extraBold};
  font-size: ${({ theme }) => theme.typography.fontSize['5xl'] * 2}px;
  color: ${({ foreground }) => foreground};
`;

const Caption = styled(Text).attrs({
  size: 'md',
  weight: 'extraBold',
  tracking: 'wide',
})<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

interface PrepareOverlayProps {
  remainingMs: number;
  foreground: string;
  backdrop: string;
}

const Backdrop = styled(Layer)<{ backdrop: string }>`
  background-color: ${({ backdrop }) => backdrop};
`;

export function PrepareOverlay({ remainingMs, foreground, backdrop }: PrepareOverlayProps) {
  const seconds = Math.max(1, Math.ceil(remainingMs / MS_PER_SECOND));
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scale.setValue(0.6);
    Animated.spring(scale, { toValue: 1, speed: 16, useNativeDriver: true }).start();
  }, [seconds, scale]);

  return (
    <Backdrop backdrop={backdrop}>
      <Count foreground={foreground} style={{ transform: [{ scale }] }}>
        {seconds}
      </Count>
      <Caption foreground={foreground}>{texts.game.prepare}</Caption>
    </Backdrop>
  );
}
