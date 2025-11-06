import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const passwordMinLength = 6;
const passwordMaxLength = 64;

export const useFormSchema = () => {
  const { t } = useTranslation('signin');

  const formSchema = useMemo(() => {
    // Безопасное получение переводов с fallback значениями
    const getTranslation = (
      key: string,
      params?: Record<string, unknown>,
      fallback?: string,
    ): string => {
      const translation = t(key, params);
      // Проверяем, что перевод - это строка и не пустая, иначе используем fallback
      if (typeof translation === 'string' && translation.length > 0) {
        return translation;
      }
      return fallback || key;
    };

    return z.object({
      email: z
        .string({
          required_error: getTranslation(
            'validation.required',
            undefined,
            'This field is required',
          ),
        })
        .email({
          message: getTranslation('validation.wrong_format', undefined, 'Incorrect data format'),
        }),
      password: z
        .string({
          required_error: getTranslation(
            'validation.required',
            undefined,
            'This field is required',
          ),
        })
        .min(passwordMinLength, {
          message: getTranslation(
            'validation.minLength',
            { length: passwordMinLength },
            `Min length is ${passwordMinLength}`,
          ),
        })
        .max(passwordMaxLength, {
          message: getTranslation(
            'validation.maxLength',
            { length: passwordMaxLength },
            `Max length is ${passwordMaxLength}`,
          ),
        }),
    });
  }, [t]);

  return formSchema;
};

export type FormData = z.infer<ReturnType<typeof useFormSchema>>;
