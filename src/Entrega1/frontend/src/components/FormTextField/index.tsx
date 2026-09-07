import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { TextField } from '../TextField';

interface FormTextFieldProps<TValues extends FieldValues>
  extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText' | 'onBlur'> {
  control: Control<TValues>;
  name: Path<TValues>;
}

export function FormTextField<TValues extends FieldValues>({
  control,
  name,
  ...inputProps
}: FormTextFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextField
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
