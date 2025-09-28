import * as z from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, 'Укажите название').max(100, 'Название не должно превышать 100 символов'),
  subject: z.number({ required_error: 'Выберите предмет' }).min(1, 'Выберите предмет'),
});

export type FormData = z.infer<typeof formSchema>;
