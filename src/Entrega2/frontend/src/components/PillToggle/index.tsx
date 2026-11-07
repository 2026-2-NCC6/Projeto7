import { Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Pill, PillLabel, Row } from './styles';

export interface PillOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface PillToggleProps<TValue extends string> {
  options: PillOption<TValue>[];
  selected: TValue;
  onSelect: (value: TValue) => void;
  raised?: boolean;
}

export function PillToggle<TValue extends string>({
  options,
  selected,
  onSelect,
  raised = false,
}: PillToggleProps<TValue>) {
  const theme = useTheme();
  const inactiveBackground = raised ? theme.colors.surfaceRaised : theme.colors.surface;

  return (
    <Row>
      {options.map((option) => {
        const active = option.value === selected;

        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Pill active={active} inactiveBackground={inactiveBackground}>
              <PillLabel active={active}>{option.label}</PillLabel>
            </Pill>
          </Pressable>
        );
      })}
    </Row>
  );
}
