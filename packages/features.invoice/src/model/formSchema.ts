import * as z from 'zod';

export const formSchema = z.object({
  studentId: z.string().min(1, 'Выберите студента'),
  subjects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Название предмета обязательно'),
        variant: z.string().min(1, 'Вариант занятия обязателен'),
        pricePerLesson: z.number(),
        unpaidLessonsAmount: z.number().min(0, 'Количество занятий не может быть отрицательным'),
        totalPrice: z.number().min(0, 'Общая стоимость занятий не может быть отрицательной'),
      }),
    )
    .min(1, 'Добавьте хотя бы один предмет'),
  invoicePrice: z.number().min(0, 'Сумма по счёту не может быть отрицательной'),
});

export type FormData = z.infer<typeof formSchema>;
