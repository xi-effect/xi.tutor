import * as z from 'zod';

export type FormData = z.infer<
  z.ZodObject<{
    telegram: z.ZodString;
    whatsapp: z.ZodString;
  }>
>;
