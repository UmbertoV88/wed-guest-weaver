import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un'email valida")
    .max(255, "L'email è troppo lunga"),
  password: z
    .string()
    .min(8, "La password deve contenere almeno 8 caratteri")
    .max(128, "La password è troppo lunga")
});

export const signUpSchema = signInSchema.extend({
  fullName: z
    .string()
    .trim()
    .min(2, "Il nome deve contenere almeno 2 caratteri")
    .max(100, "Il nome è troppo lungo")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Il nome può contenere solo lettere, spazi, apostrofi e trattini"
    ),
  password: z
    .string()
    .min(8, "La password deve contenere almeno 8 caratteri")
    .max(128, "La password è troppo lunga")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero")
    .regex(/[^A-Za-z0-9]/, "La password deve contenere almeno un carattere speciale")
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
