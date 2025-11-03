import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const usernameMinLength = 4;
const usernameMaxLength = 30;
const passwordMinLength = 6;

export const useFormSchema = () => {
  const { t } = useTranslation('signup');

  const formSchema = useMemo(() => {
    return z.object({
      username: z
        .string()
        .min(1, {
          message: t('validation.required'),
        })
        .min(usernameMinLength, {
          message: `${t('validation.minLength')}${t('validation.symbols', { count: usernameMinLength })}`,
        })
        .max(usernameMaxLength, {
          message: `${t('validation.maxLength')}${t('validation.symbols', { count: usernameMaxLength })}`,
        })
        .regex(/^[a-z0-9_.]+$/, {
          message: t('validation.no_symbols'),
        }),
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
          message: `${t('validation.minLength')}${t('validation.symbols', { count: passwordMinLength })}`,
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
