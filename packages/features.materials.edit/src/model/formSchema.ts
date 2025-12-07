import * as z from 'zod';

export const formSchema = z.object({
  name: z
    .string()
    .nonempty('Укажите название')
    .max(100, 'Название не должно превышать 100 символов'),
});

export type FormData = z.infer<typeof formSchema>;
