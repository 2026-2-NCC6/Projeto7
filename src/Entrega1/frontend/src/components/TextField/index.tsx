import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ErrorMessage, Field } from './styles';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  error?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { error, onFocus, onBlur, ...rest },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Field
        ref={ref}
        focused={focused}
        invalid={Boolean(error)}
        placeholderTextColor={theme.colors.inkSoft}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </View>
  );
});
