import { paymentsApiConfig, PaymentsQueryKey, ClassroomPaymentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';
import { trackPaymentConfirmed } from 'common.utils';
import { toast } from 'sonner';

type ReceiverConfirmationInput = string | { invoiceId: string; revenue?: string | number };

export const usePaymentReceiverConfirmation = ({
  classroomId,
  onSuccess,
}: { classroomId?: string; onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  const paymentReceiverConfirmationMutation = useMutation({
    mutationFn: async (input: ReceiverConfirmationInput) => {
      const invoiceId = typeof input === 'string' ? input : input.invoiceId;
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentsApiConfig[PaymentsQueryKey.PaymentReceiverConfirmation].method,
          url: paymentsApiConfig[PaymentsQueryKey.PaymentReceiverConfirmation].getUrl(invoiceId),
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
    onSuccess: (response, input) => {
      onSuccess?.();

      if (response?.status === 204) {
        if (typeof input !== 'string') {
          trackPaymentConfirmed(input.revenue, 'receiver');
        }
        queryClient.invalidateQueries({ queryKey: [PaymentsQueryKey.TutorPayments, 'tutor'] });
        queryClient.invalidateQueries({ queryKey: [PaymentsQueryKey.TutorPayments, 'list'] });
        if (classroomId) {
          queryClient.invalidateQueries({
            queryKey: [ClassroomPaymentsQueryKey.TutorPayments, classroomId, 'list'],
          });
        }
      }

      toast.success('Оплата счета подтверждена');
    },
  });

  return { ...paymentReceiverConfirmationMutation };
};
