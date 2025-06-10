import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const passwordMinLength = 6;

export type FormDataPassword = z.infer<
  z.ZodObject<{
    password: z.ZodString;
    confirmPassword: z.ZodString;
  }>
>;

export const useFormSchemaPassword = () => {
  const { t } = useTranslation('resetPassword');

  const formSchemaPassword = useMemo(() => {
    return z
      .object({
        password: z
          .string({
            required_error: t('validation.required'),
          })
          .min(passwordMinLength, {
            message: t('validation.minLength') + passwordMinLength,
          }),
        confirmPassword: z
          .string({
            required_error: t('validation.required'),
          })
          .min(passwordMinLength, {
            message: t('validation.minLength') + passwordMinLength,
          }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t('resetPassword.passwordsDoNotMatch'),
        path: ['confirmPassword'],
      });
  }, [t]);

  return formSchemaPassword;
};
