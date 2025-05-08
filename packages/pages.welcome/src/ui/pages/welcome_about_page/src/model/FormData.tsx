import * as z from 'zod';

export type FormData = z.infer<
  z.ZodObject<{
    question: z.ZodString;
  }>
>;
