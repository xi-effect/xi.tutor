import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { normalizeEmail } from 'common.utils';

export const createFormSchemaEmail = (t: (key: string) => string) =>
  z.object({
    email: z
      .string({
        error: t('validation.required'),
      })
      .transform(normalizeEmail)
      .pipe(
        z
          .string()
          .min(1, { message: t('validation.required') })
          .email({ message: t('validation.wrong_format') })
          .refine(
            (email) => {
              const domainPart = email.split('@')[1];
              return domainPart?.length >= 3 && domainPart.includes('.');
            },
            {
              message: t('validation.wrong_format'),
            },
          ),
      ),
  });

export type FormDataEmail = z.infer<ReturnType<typeof createFormSchemaEmail>>;

export const useFormSchemaEmail = () => {
  const { t } = useTranslation('resetPassword');

  return useMemo(() => createFormSchemaEmail(t), [t]);
};
