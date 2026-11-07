import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { signUpSchema, type SignUpFormValues } from '../services/auth/validation';
import { useAuthStore } from '../store/authStore';
import { toFormErrorMessage } from './formError';

export interface SignUpForm {
  form: UseFormReturn<SignUpFormValues>;
  submit: () => void;
  formError: string | null;
  submitting: boolean;
}

export function useSignUp(): SignUpForm {
  const signUp = useAuthStore((state) => state.signUp);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signUp(values);
    } catch (error) {
      setFormError(toFormErrorMessage(error));
    }
  });

  return { form, submit, formError, submitting: form.formState.isSubmitting };
}
