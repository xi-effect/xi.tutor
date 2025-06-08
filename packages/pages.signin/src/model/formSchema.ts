import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const passwordMinLength = 6;

export const useFormSchema = () => {
  const { t } = useTranslation('signin');

  const formSchema = useMemo(() => {
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
          message: t('validation.minLength'),
        }),
    });
  }, [t]);

  return formSchema;
};

export type FormData = z.infer<
  z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
  }>
>;
