import { useQuery } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';
import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { PaymentDataT } from '../types';

export const useGetPayment = (recipientInvoiceId?: number) => {
  const getPaymentQuery = useQuery<PaymentDataT | null>({
    queryKey: ['get-payment', recipientInvoiceId],
    queryFn: async (): Promise<PaymentDataT | null> => {
      if (!recipientInvoiceId) return null;

      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentsApiConfig[PaymentsQueryKey.GetPayment].method,
          url: paymentsApiConfig[PaymentsQueryKey.GetPayment].getUrl(String(recipientInvoiceId)),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data as PaymentDataT;
      } catch (err) {
        console.error('Ошибка при получении счёта:', err);
        throw err;
      }
    },
    enabled: !!recipientInvoiceId,
  });

  return { ...getPaymentQuery };
};
