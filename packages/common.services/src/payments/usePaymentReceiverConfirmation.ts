import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';
import { toast } from 'sonner';

export const usePaymentReceiverConfirmation = () => {
  const queryClient = useQueryClient();

  const paymentReceiverConfirmationMutation = useMutation({
    mutationFn: async (invoice_id: string) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentsApiConfig[PaymentsQueryKey.PaymentReceiverConfirmation].method,
          url: paymentsApiConfig[PaymentsQueryKey.PaymentReceiverConfirmation].getUrl(invoice_id),
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
        queryClient.invalidateQueries({ queryKey: [PaymentsQueryKey.TutorPayments, 'tutor'] });
      }

      toast.success('Оплата счета подтверждена');
    },
  });

  return { ...paymentReceiverConfirmationMutation };
};
