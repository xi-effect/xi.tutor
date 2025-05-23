import * as z from 'zod';

export type WelcomeUserFormData = z.infer<
  z.ZodObject<{
    displayName: z.ZodString;
  }>
>;
