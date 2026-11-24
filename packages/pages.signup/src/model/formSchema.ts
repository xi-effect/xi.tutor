import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { normalizeEmail } from 'common.utils';

const displayNameMinLength = 2;
const displayNameMaxLength = 30;
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
    display_name: z
      .string()
      .trim()
      .min(1, {
        message: getTranslation('validation.required', undefined, 'This field is required'),
      })
      .min(displayNameMinLength, {
        message: `${getTranslation('validation.minLength', undefined, 'Minimum ')}${getTranslation('validation.symbols', { count: displayNameMinLength }, `${displayNameMinLength} symbols`)}`,
      })
      .max(displayNameMaxLength, {
        message: `${getTranslation('validation.maxLength', undefined, 'Maximum ')}${getTranslation('validation.symbols', { count: displayNameMaxLength }, `${displayNameMaxLength} symbols`)}`,
      }),
    email: z
      .string({
        error: getTranslation('validation.required', undefined, 'This field is required'),
      })
      .transform(normalizeEmail)
      .pipe(
        z.string().email({
          message: getTranslation('validation.wrong_format', undefined, 'Incorrect data format'),
        }),
      ),
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
