import {
  buildInvoiceSearchRequest,
  paymentsApiConfig,
  PaymentsQueryKey,
  serializeInvoiceFilters,
  type InvoiceSearchFilters,
} from 'common.api';
import { useFetching } from 'common.config';
import { RolePaymentT } from 'common.types';

interface StudentPaymentsListParams {
  disabled?: boolean;
  filters?: InvoiceSearchFilters;
}

/**
 * Упрощенный хук для получения первых 50 платежей ученика
 * Автоматически устанавливает limit=50 и не требует передачи cursor
 */
export const useGetStudentPaymentsList = ({
  disabled = false,
  filters,
}: StudentPaymentsListParams = {}) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: paymentsApiConfig[PaymentsQueryKey.StudentPayments].method,
      getUrl: () => paymentsApiConfig[PaymentsQueryKey.StudentPayments].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    data: buildInvoiceSearchRequest('student', null, 50, filters),
    disabled: disabled,
    queryKey: [
      PaymentsQueryKey.StudentPayments,
      'list',
      serializeInvoiceFilters('student', filters),
    ],
  });

  return {
    data: data as RolePaymentT<'student'>[],
    isError,
    isLoading,
    ...rest,
  };
};
