import {
  buildInvoiceSearchRequest,
  paymentsApiConfig,
  PaymentsQueryKey,
  serializeInvoiceFilters,
  type InvoiceSearchFilters,
} from 'common.api';
import { useFetching } from 'common.config';
import { RolePaymentT } from 'common.types';

interface TutorPaymentsListParams {
  disabled?: boolean;
  filters?: InvoiceSearchFilters;
}

/**
 * Упрощенный хук для получения первых 50 платежей репетитора
 * Автоматически устанавливает limit=50 и не требует передачи cursor
 */
export const useGetTutorPaymentsList = ({
  disabled = false,
  filters,
}: TutorPaymentsListParams = {}) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: paymentsApiConfig[PaymentsQueryKey.TutorPayments].method,
      getUrl: () => paymentsApiConfig[PaymentsQueryKey.TutorPayments].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    data: buildInvoiceSearchRequest('tutor', null, 50, filters),
    disabled: disabled,
    queryKey: [PaymentsQueryKey.TutorPayments, 'list', serializeInvoiceFilters('tutor', filters)],
  });

  return {
    data: data as RolePaymentT<'tutor'>[],
    isError,
    isLoading,
    ...rest,
  };
};
