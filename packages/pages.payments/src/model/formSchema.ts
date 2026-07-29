import * as z from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useFormSchema = () => {
  const { t } = useTranslation('payments');

  return useMemo(
    () =>
      z.object({
        name: z.string().nonempty(t('validation.nameRequired')).max(100, t('validation.nameMax')),
        price: z.preprocess(
          (val) => {
            if (typeof val === 'string' && val.trim() === '') return undefined;
            return Number(val);
          },
          z
            .number({ error: t('validation.priceNumber') })
            .positive(t('validation.pricePositive'))
            .lt(100000, t('validation.priceMax'))
            .refine(
              (val) => {
                return /^\d+(\.\d{1,2})?$/.test(val.toString());
              },
              { message: t('validation.priceDecimals') },
            ),
        ),
      }),
    [t],
  );
};

export type FormData = z.infer<ReturnType<typeof useFormSchema>>;
