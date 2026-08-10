import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const passwordMinLength = 6;
const passwordMaxLength = 64;

type Translate = (key: string, params?: Record<string, unknown>) => unknown;

/** Чистая zod-схема входа — удобно тестировать без React/i18n. */
export const createFormSchema = (t: Translate) => {
  const getTranslation = (
    key: string,
    params?: Record<string, unknown>,
    fallback?: string,
  ): string => {
    const translation = t(key, params);
    if (typeof translation === 'string' && translation.length > 0) {
      return translation;
    }
    return fallback || key;
  };

  return z.object({
    email: z
      .string({
        error: getTranslation('validation.required', undefined, 'This field is required'),
      })
      .email({
        message: getTranslation('validation.wrong_format', undefined, 'Incorrect data format'),
      }),
    password: z
      .string({
        error: getTranslation('validation.required', undefined, 'This field is required'),
      })
      .min(passwordMinLength, {
        message: getTranslation(
          'validation.minLength',
          { length: passwordMinLength },
          `Minimum ${passwordMinLength} characters`,
        ),
      })
      .max(passwordMaxLength, {
        message: getTranslation(
          'validation.maxLength',
          { length: passwordMaxLength },
          `Maximum ${passwordMaxLength} characters`,
        ),
      }),
  });
};

export const useFormSchema = () => {
  const { t } = useTranslation('signin');
  return useMemo(() => createFormSchema(t), [t]);
};

export type FormData = z.infer<ReturnType<typeof createFormSchema>>;
