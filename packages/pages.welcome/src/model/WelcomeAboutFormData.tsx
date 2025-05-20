import * as z from 'zod';

export type WelcomeAboutFormData = z.infer<
  z.ZodObject<{
    question: z.ZodString;
  }>
>;
