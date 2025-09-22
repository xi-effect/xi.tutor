import * as z from 'zod';

export const formSchema = z.object({
  name: z
    .string()
    .nonempty('Укажите название')
    .max(100, 'Название не должно превышать 100 символов'),
  price: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined;
      return Number(val);
    },
    z
      .number({ required_error: 'Введите число', invalid_type_error: 'Введите число' })
      .positive('Стоимость должна быть больше нуля')
      .lt(100000, 'Стоимость не должна превышать 100000')
      .refine(
        (val) => {
          return /^\d+(\.\d{1,2})?$/.test(val.toString());
        },
        { message: 'Допустимы максимум 2 знака после запятой' },
      ),
  ),
});

export type FormData = z.infer<typeof formSchema>;
