import * as z from 'zod';

export const formSchema = z.object({
  studentId: z.string().min(1, 'Выберите студента'),
  items: z
    .array(
      z.object({
        name: z.string().min(1, 'Название предмета обязательно'),
        price: z.number().min(0, 'Цена не может быть отрицательной'),
        quantity: z.number().min(1, 'Количество не может быть меньше 1'),
      }),
    )
    .min(1, 'Добавьте хотя бы один предмет'),
  comment: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;
