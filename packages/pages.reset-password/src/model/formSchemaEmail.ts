import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export type FormDataEmail = z.infer<
  z.ZodObject<{
    email: z.ZodString;
  }>
>;

export const useFormSchemaEmail = () => {
  const { t } = useTranslation('resetPassword');

  const formSchemaEmail = useMemo(() => {
    return z.object({
      email: z
        .string({
          required_error: t('validation.required'),
        })
        .email({
          message: t('validation.wrong_format'),
        }),
    });
  }, [t]);

  return formSchemaEmail;
};
