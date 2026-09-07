import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { signInSchema, type SignInFormValues } from '../services/auth/validation';
import { useAuthStore } from '../store/authStore';
import { toFormErrorMessage } from './formError';

export interface SignInForm {
  form: UseFormReturn<SignInFormValues>;
  submit: () => void;
  formError: string | null;
  submitting: boolean;
}

export function useSignIn(): SignInForm {
  const signIn = useAuthStore((state) => state.signIn);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn(values);
    } catch (error) {
      setFormError(toFormErrorMessage(error));
    }
  });

  return { form, submit, formError, submitting: form.formState.isSubmitting };
}
