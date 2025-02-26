import * as z from 'zod';

export const FormSchema = z.object({
  email: z
    .string({ required_error: 'Обязательное поле' })
    .email({ message: 'Некорректный формат данных' }),
  password: z
    .string({ required_error: 'Обязательное поле' })
    .min(1, { message: 'Обязательное поле' }),
});

export type FormData = z.infer<typeof FormSchema>;
