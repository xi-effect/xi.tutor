import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { RolePaymentT } from 'common.types';

interface TutorPaymentsListParams {
  disabled?: boolean;
}

/**
 * Упрощенный хук для получения первых 50 платежей репетитора
 * Автоматически устанавливает limit=50 и не требует передачи cursor
 */
export const useGetTutorPaymentsList = ({ disabled = false }: TutorPaymentsListParams = {}) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: paymentsApiConfig[PaymentsQueryKey.TutorPayments].method,
      getUrl: () => paymentsApiConfig[PaymentsQueryKey.TutorPayments].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    data: {
      limit: 50,
    },
    disabled: disabled,
    queryKey: [PaymentsQueryKey.TutorPayments, 'list'],
  });

  return {
    data: data as RolePaymentT<'tutor'>[],
    isError,
    isLoading,
    ...rest,
  };
};
