import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from 'styled-components/native';
import { TARGET_COLORS, type TargetColor } from '../../types/game';

const COLOR_FADE_MS = 320;

export interface ColorWash {
  /** Animated background that crossfades between the wall's target colours. */
  readonly background: Animated.AnimatedInterpolation<string>;
  readonly tone: { background: string; foreground: string };
  /** Translucent layer that reads correctly over the current colour. */
  readonly overlay: string;
}

/** The screen turns the colour of the target being asked for. */
export function useColorWash(activeColor: TargetColor): ColorWash {
  const theme = useTheme();
  const blend = useRef(new Animated.Value(TARGET_COLORS.indexOf(activeColor))).current;

  useEffect(() => {
    Animated.timing(blend, {
      toValue: TARGET_COLORS.indexOf(activeColor),
      duration: COLOR_FADE_MS,
      useNativeDriver: false,
    }).start();
  }, [activeColor, blend]);

  const tone = theme.colors.target[activeColor];

  return {
    background: blend.interpolate({
      inputRange: TARGET_COLORS.map((_, index) => index),
      outputRange: TARGET_COLORS.map((color) => theme.colors.target[color].background),
    }),
    tone,
    overlay:
      tone.foreground === theme.colors.onInk
        ? theme.colors.translucentDark
        : theme.colors.translucentLight,
  };
}
