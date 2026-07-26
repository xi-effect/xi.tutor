import * as z from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useFormSchema = () => {
  const { t } = useTranslation('classroomRename');

  return useMemo(
    () =>
      z.object({
        name: z.string().nonempty(t('validation.nameRequired')).max(100, t('validation.nameMax')),
      }),
    [t],
  );
};

export type FormData = z.infer<ReturnType<typeof useFormSchema>>;
