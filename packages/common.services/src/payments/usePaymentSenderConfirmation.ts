import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';
import { PaymentTypeT } from 'common.types';

export const usePaymentSenderConfirmation = () => {
  const queryClient = useQueryClient();

  const paymentSenderConfirmationMutation = useMutation({
    mutationFn: async ({
      invoice_id,
      paymentType,
    }: {
      invoice_id: string;
      paymentType: PaymentTypeT;
    }) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentsApiConfig[PaymentsQueryKey.PaymentSenderConfirmation].method,
          url: paymentsApiConfig[PaymentsQueryKey.PaymentSenderConfirmation].getUrl(invoice_id),
          data: {
            payment_type: paymentType,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (err) {
        console.error('Ошибка:', err);
        throw err;
      }
    },
    onError: (err) => {
      handleError(err, 'addInvoiceTemplate');
    },
    onSuccess: (response) => {
      if (response?.status === 204) {
        queryClient.invalidateQueries({ queryKey: [PaymentsQueryKey.StudentPayments, 'student'] });
      }
    },
  });

  return { ...paymentSenderConfirmationMutation };
};
