import { paymentsApiConfig, PaymentsQueryKey, type UserRoleT } from 'common.api';
import { useFetching } from 'common.config';

export const useFetchPayments = (
  role: UserRoleT,
  lastOpenedBefore?: string,
  disabled?: boolean,
) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: paymentsApiConfig[PaymentsQueryKey.Payments].method,
      getUrl: () => paymentsApiConfig[PaymentsQueryKey.Payments].getUrl(role),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: lastOpenedBefore
      ? [PaymentsQueryKey.Payments, lastOpenedBefore]
      : [PaymentsQueryKey.Payments],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
