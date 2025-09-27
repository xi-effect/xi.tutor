import * as z from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, 'Укажите название').max(100, 'Название не должно превышать 100 символов'),
  subject: z
    .string()
    .nonempty('Введите предметы через запятую')
    .max(100, 'Текст не должен превышать 100 символов')
    .transform((value) =>
      value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    )
    .refine((subjects) => (subjects as string[]).length > 0, 'Нужно указать хотя бы один предмет'),
});

export type FormData = z.infer<typeof formSchema>;
