import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

export interface CreateInvoicePayload {
  invoice: {
    comment: string | null;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  student_ids: number[] | null;
}

export interface CreateInvoiceResponse {
  id: number;
  // Добавьте другие поля ответа по необходимости
}

interface CreateInvoiceParams {
  classroomId: string;
  payload: CreateInvoicePayload;
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  const createInvoiceMutation = useMutation({
    mutationFn: async ({ classroomId, payload }: CreateInvoiceParams) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentsApiConfig[PaymentsQueryKey.AddInvoice].method,
          url: paymentsApiConfig[PaymentsQueryKey.AddInvoice].getUrl(classroomId),
          data: payload,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (err) {
        console.error('Ошибка при создании счёта:', err);
        throw err;
      }
    },
    onError: (err) => {
      handleError(err, 'addInvoiceTemplate');
    },
    onSuccess: (response, variables) => {
      if (response?.data) {
        const { classroomId } = variables;
        // Инвалидируем кеш для обновления списка счетов
        queryClient.invalidateQueries({ queryKey: [PaymentsQueryKey.TutorPayments, 'tutor'] });
        queryClient.invalidateQueries({ queryKey: [PaymentsQueryKey.TutorPayments, 'list'] });
        if (classroomId) {
          queryClient.invalidateQueries({
            queryKey: [PaymentsQueryKey.TutorPayments, classroomId, 'list'],
          });
        }
      }

      showSuccess('addInvoiceTemplate', 'Счёт успешно создан');
    },
  });

  return { ...createInvoiceMutation };
};
