import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

export interface CreateInvoicePayload {
  invoice: {
    comment: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  student_ids: number[];
}

export interface CreateInvoiceResponse {
  id: number;
  // Добавьте другие поля ответа по необходимости
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentsApiConfig[PaymentsQueryKey.AddPayment].method,
          url: paymentsApiConfig[PaymentsQueryKey.AddPayment].getUrl(),
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
    onSuccess: (response) => {
      if (response?.data) {
        // Инвалидируем кеш для обновления списка счетов
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
      showSuccess('addInvoiceTemplate', 'Счёт успешно создан');
    },
  });

  return { ...createInvoiceMutation };
};
