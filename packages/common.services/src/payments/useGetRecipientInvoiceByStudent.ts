import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useGetRecipientInvoiceByStudent = (recipientInvoiceId: number, disabled?: boolean) => {
  const getPaymentQuery = useFetching({
    apiConfig: {
      method: paymentsApiConfig[PaymentsQueryKey.GetRecipientInvoiceByStudent].method,
      getUrl: () =>
        paymentsApiConfig[PaymentsQueryKey.GetRecipientInvoiceByStudent].getUrl(
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
