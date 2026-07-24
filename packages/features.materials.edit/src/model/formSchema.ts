import * as z from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useFormSchema = () => {
  const { t } = useTranslation('materialsEdit');

  return useMemo(
    () =>
      z.object({
        name: z.string().nonempty(t('validation.required')).max(100, t('validation.max')),
      }),
    [t],
  );
};

export type FormData = z.infer<ReturnType<typeof useFormSchema>>;
