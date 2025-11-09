import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const usernameMinLength = 4;
const usernameMaxLength = 30;
const passwordMinLength = 6;

export const useFormSchema = () => {
  const { t } = useTranslation('signup');

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
      username: z
        .string()
        .min(1, {
          message: getTranslation('validation.required', undefined, 'This field is required'),
        })
        .min(usernameMinLength, {
          message: `${getTranslation('validation.minLength', undefined, 'Min length is ')}${getTranslation('validation.symbols', { count: usernameMinLength }, `${usernameMinLength} symbols`)}`,
        })
        .max(usernameMaxLength, {
          message: `${getTranslation('validation.maxLength', undefined, 'Max length is ')}${getTranslation('validation.symbols', { count: usernameMaxLength }, `${usernameMaxLength} symbols`)}`,
        })
        .regex(/^[a-z0-9_.]+$/, {
          message: getTranslation(
            'validation.no_symbols',
            undefined,
            "Use only Latin alphabet, lowercase, numbers or symbols: '_' or '.'",
          ),
        }),
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
          message: `${getTranslation('validation.minLength', undefined, 'Min length is ')}${getTranslation('validation.symbols', { count: passwordMinLength }, `${passwordMinLength} symbols`)}`,
        }),
      consent: z.boolean().refine((value) => !!value, {
        message: '',
      }),
    });
  }, [t]);

  return formSchema;
};

export type FormData = z.infer<
  z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    consent: z.ZodLiteral<boolean>;
  }>
>;
