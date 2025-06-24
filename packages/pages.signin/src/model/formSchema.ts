import * as z from 'zod';
import { useTranslation } from 'react-i18next';

const passwordMinLength = 6;
const passwordMaxLength = 20;

export const useFormSchema = () => {
  const { t } = useTranslation('signin');

  return z.object({
    email: z
      .string({
        required_error: t('validation.required'),
      })
      .email({
        message: t('validation.wrong_format'),
      }),
    password: z
      .string({
        required_error: t('validation.required'),
      })
      .min(passwordMinLength, {
        message: t('validation.minLength', { length: passwordMinLength }),
      })
      .max(passwordMaxLength, {
        message: t('validation.maxLength', { length: passwordMaxLength }),
      }),
  });
};

export type FormData = z.infer<ReturnType<typeof useFormSchema>>;
