import * as z from 'zod';

export type WelcomeSocialsFormData = z.infer<
  z.ZodObject<{
    telegram: z.ZodString;
    whatsapp: z.ZodString;
  }>
>;
