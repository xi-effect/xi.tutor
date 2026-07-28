import * as z from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useFormSchema = () => {
  const { t } = useTranslation('groupAdd');

  return useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('validation.nameRequired')).max(100, t('validation.nameMax')),
        subject: z.number({ error: t('validation.subjectRequired') }).nullable(),
      }),
    [t],
  );
};

export type FormData = z.infer<ReturnType<typeof useFormSchema>>;
