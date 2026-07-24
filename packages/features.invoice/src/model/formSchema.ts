import { useMemo } from 'react';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';

export const useFormSchema = () => {
  const { t } = useTranslation('invoice');

  return useMemo(
    () =>
      z.object({
        classroomId: z.string().nonempty(t('validation.classroomRequired')),
        items: z
          .array(
            z.object({
              id: z.string(),
              name: z.string().min(1, t('validation.subjectNameRequired')),
              price: z
                .union([z.string(), z.number()])
                .transform((val) => {
                  if (val === '' || val === null || val === undefined) return 0;
                  return typeof val === 'string' ? Number(val) || 0 : val;
                })
                .pipe(z.number().min(0, t('validation.priceNegative'))),
              quantity: z.number().min(1, t('validation.quantityMin')),
            }),
          )
          .min(1, t('validation.itemsMin')),
        comment: z.string().optional(),
      }),
    [t],
  );
};

export type FormInput = z.input<ReturnType<typeof useFormSchema>>;
export type FormData = z.output<ReturnType<typeof useFormSchema>>;
