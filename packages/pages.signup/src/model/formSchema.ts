import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const usernameMinLength = 4;
const usernameMaxLength = 30;
const passwordMinLength = 6;

type Translate = (key: string, params?: Record<string, unknown>) => unknown;

/** Чистая zod-схема регистрации — удобно тестировать без React/i18n. */
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
    username: z
      .string()
      .min(1, {
        message: getTranslation('validation.required', undefined, 'This field is required'),
      })
      .min(usernameMinLength, {
        message: `${getTranslation('validation.minLength', undefined, 'Minimum ')}${getTranslation('validation.symbols', { count: usernameMinLength }, `${usernameMinLength} symbols`)}`,
      })
      .max(usernameMaxLength, {
        message: `${getTranslation('validation.maxLength', undefined, 'Maximum ')}${getTranslation('validation.symbols', { count: usernameMaxLength }, `${usernameMaxLength} symbols`)}`,
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
        message: `${getTranslation('validation.minLength', undefined, 'Minimum ')}${getTranslation('validation.symbols', { count: passwordMinLength }, `${passwordMinLength} symbols`)}`,
      }),
    consent: z.boolean().refine((value) => !!value, {
      message: getTranslation('consent.required', undefined, 'Please accept the terms to continue'),
    }),
  });
};

export const useFormSchema = () => {
  const { t } = useTranslation('signup');
  return useMemo(() => createFormSchema(t), [t]);
};

export type FormData = z.infer<ReturnType<typeof createFormSchema>>;
