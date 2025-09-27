import * as z from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, 'Укажите название').max(100, 'Название не должно превышать 100 символов'),
  subject: z
    .string()
    .nonempty('Введите предметы через запятую')
    .max(100, 'Текст не должен превышать 100 символов')
    .refine(
      (value) =>
        value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean).length > 0,
      { message: 'Нужно указать хотя бы один предмет' },
    ),
});

export type FormData = z.infer<typeof formSchema>;
