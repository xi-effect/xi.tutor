import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useGetRecipientInvoiceByTutor = (recipientInvoiceId: number, disabled?: boolean) => {
  const getPaymentQuery = useFetching({
    apiConfig: {
      method: paymentsApiConfig[PaymentsQueryKey.GetRecipientInvoiceByTutor].method,
      getUrl: () =>
        paymentsApiConfig[PaymentsQueryKey.GetRecipientInvoiceByTutor].getUrl(
          String(recipientInvoiceId),
        ),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !recipientInvoiceId,
    queryKey: [PaymentsQueryKey.GetRecipientInvoiceByTutor, recipientInvoiceId],
  });

  return { ...getPaymentQuery };
};
