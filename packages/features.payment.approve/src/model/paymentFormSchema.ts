import { useMemo } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const usePaymentFormSchema = () => {
  const { t } = useTranslation('paymentApprove');

  return useMemo(
    () =>
      z.object({
        typePayment: z.enum(['cash', 'transfer'], {
          error: t('validation.paymentTypeRequired'),
        }),
      }),
    [t],
  );
};

export type PaymentFormData = z.infer<ReturnType<typeof usePaymentFormSchema>>;
