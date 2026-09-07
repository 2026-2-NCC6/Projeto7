import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 8;

export const signInSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.'),
  email: z.email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
