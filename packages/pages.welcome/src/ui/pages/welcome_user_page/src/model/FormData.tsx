import * as z from 'zod';

export type FormData = z.infer<
  z.ZodObject<{
    displayName: z.ZodString;
  }>
>;
