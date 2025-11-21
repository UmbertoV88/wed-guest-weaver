import { z } from 'zod';

// Schema per validare i compagni
export const companionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Il nome deve contenere almeno 2 caratteri")
    .max(100, "Il nome è troppo lungo")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Il nome può contenere solo lettere, spazi, apostrofi e trattini"
    ),
  allergies: z
    .string()
    .trim()
    .max(200, "Le allergie non possono superare 200 caratteri")
    .optional()
    .or(z.literal('')),
  ageGroup: z.enum(['Adulto', 'Ragazzo', 'Bambino'], {
    errorMap: () => ({ message: "Seleziona una fascia d'età valida" })
  })
});

// Schema per il form principale dell'ospite
export const guestFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Il nome deve contenere almeno 2 caratteri")
    .max(100, "Il nome è troppo lungo")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Il nome può contenere solo lettere, spazi, apostrofi e trattini"
    ),
  category: z.enum([
    'family-his',
    'family-hers',
    'friends',
    'colleagues'
  ], {
    errorMap: () => ({ message: "Seleziona una categoria valida" })
  }),
  ageGroup: z.enum(['Adulto', 'Ragazzo', 'Bambino'], {
    errorMap: () => ({ message: "Seleziona una fascia d'età valida" })
  }),
  allergies: z
    .string()
    .trim()
    .max(200, "Le allergie non possono superare 200 caratteri")
    .optional()
    .or(z.literal('')),
  companionCount: z
    .number()
    .int()
    .min(0, "Il numero di accompagnatori non può essere negativo")
    .max(20, "Non puoi aggiungere più di 20 accompagnatori"),
  companions: z.array(companionSchema)
});

export type GuestFormInput = z.infer<typeof guestFormSchema>;
export type CompanionInput = z.infer<typeof companionSchema>;
