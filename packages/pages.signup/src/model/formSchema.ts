import * as z from 'zod';

export const FormSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: 'Обязательное поле',
    })
    .min(4, {
      message: 'Минимальная длина - 4 символов',
    })
    .max(30, {
      message: 'Максимальная длина - 30 символов',
    })
    .regex(/^[a-z0-9_.]+$/, {
      message:
        'Используйте только латинский алфавит, в нижнем регистре, цифры или знаки: "_" или "."',
    }),
  email: z
    .string({
      required_error: 'Обязательное поле',
    })
    .email({
      message: 'Некорректный формат данных',
    }),
  password: z
    .string({
      required_error: 'Обязательное поле',
    })
    .min(6, {
      message: 'Минимальная длина пароля - 6 символов',
    }),
});

export type FormData = z.infer<typeof FormSchema>;
