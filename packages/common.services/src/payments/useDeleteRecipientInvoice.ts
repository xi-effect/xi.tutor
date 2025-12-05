import { paymentsApiConfig, PaymentsQueryKey, ClassroomPaymentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';

export const useDeleteRecipientInvoice = (classroomId?: string) => {
  const queryClient = useQueryClient();

  const deleteRecipientInvoiceMutation = useMutation({
    mutationFn: async (invoice_id: string) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentsApiConfig[PaymentsQueryKey.DeleteRecipientInvoice].method,
          url: paymentsApiConfig[PaymentsQueryKey.DeleteRecipientInvoice].getUrl(invoice_id),
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
        if (classroomId) {
          queryClient.invalidateQueries({
            queryKey: [ClassroomPaymentsQueryKey.TutorPayments, classroomId, 'list'],
          });
        }
      }
    },
  });

  return { ...deleteRecipientInvoiceMutation };
};
