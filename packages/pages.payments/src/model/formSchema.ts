import * as z from 'zod';

export const formSchema = z.object({
  name: z.string().nonempty('Укажите название'),
  price: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined;
      return Number(val);
    },
    z
      .number({ required_error: 'Введите число', invalid_type_error: 'Введите число' })
      .positive('Стоимость должна быть больше нуля'),
  ),
});

export type FormData = z.infer<typeof formSchema>;
