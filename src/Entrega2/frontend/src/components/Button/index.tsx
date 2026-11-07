import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Container, Label, type ButtonVariant } from './styles';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const PRESSED_SCALE = 0.97;

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) =>
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40 }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(PRESSED_SCALE)}
      onPressOut={() => animateTo(1)}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Animated.View
        style={[{ transform: [{ scale }] }, variant === 'primary' ? theme.shadows.primaryButton : null]}
      >
        <Container variant={variant} disabled={disabled}>
          <Label variant={variant}>{label}</Label>
        </Container>
      </Animated.View>
    </Pressable>
  );
}
