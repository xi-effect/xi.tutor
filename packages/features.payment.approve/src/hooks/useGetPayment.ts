import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useGetPayment = (recipientInvoiceId: number, disabled?: boolean) => {
  const getPaymentQuery = useFetching({
    apiConfig: {
      method: paymentsApiConfig[PaymentsQueryKey.GetPayment].method,
      getUrl: () =>
        paymentsApiConfig[PaymentsQueryKey.GetPayment].getUrl(String(recipientInvoiceId)),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !recipientInvoiceId,
    queryKey: [PaymentsQueryKey.GetPayment, recipientInvoiceId],
  });

  return { ...getPaymentQuery };
};
