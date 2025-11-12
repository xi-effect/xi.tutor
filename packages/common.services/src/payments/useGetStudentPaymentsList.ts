import { paymentsApiConfig, PaymentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { RolePaymentT } from 'common.types';

interface StudentPaymentsListParams {
  disabled?: boolean;
}

/**
 * Упрощенный хук для получения первых 50 платежей ученика
 * Автоматически устанавливает limit=50 и не требует передачи cursor
 */
export const useGetStudentPaymentsList = ({ disabled = false }: StudentPaymentsListParams = {}) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: paymentsApiConfig[PaymentsQueryKey.StudentPayments].method,
      getUrl: () => paymentsApiConfig[PaymentsQueryKey.StudentPayments].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    data: {
      limit: 50,
    },
    disabled: disabled,
    queryKey: [PaymentsQueryKey.StudentPayments, 'list'],
  });

  return {
    data: data as RolePaymentT<'student'>[],
    isError,
    isLoading,
    ...rest,
  };
};
