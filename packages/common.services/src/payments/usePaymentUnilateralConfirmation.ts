import { paymentsApiConfig, PaymentsQueryKey, ClassroomPaymentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';
import { PaymentTypeT } from 'common.types';

export const usePaymentUnilateralConfirmation = (classroomId?: string) => {
  const queryClient = useQueryClient();

  const paymentUnilateralConfirmationMutation = useMutation({
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
          method: paymentsApiConfig[PaymentsQueryKey.PaymentUnilateralConfirmation].method,
          url: paymentsApiConfig[PaymentsQueryKey.PaymentUnilateralConfirmation].getUrl(invoice_id),
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
        queryClient.invalidateQueries({ queryKey: [PaymentsQueryKey.TutorPayments, 'tutor'] });
        queryClient.invalidateQueries({ queryKey: [PaymentsQueryKey.TutorPayments, 'list'] });
        if (classroomId) {
          console.log(classroomId, 'list');
          queryClient.invalidateQueries({
            queryKey: [ClassroomPaymentsQueryKey.TutorPayments, classroomId, 'list'],
          });
        }
      }
    },
  });

  return { ...paymentUnilateralConfirmationMutation };
};
