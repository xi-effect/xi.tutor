import { paymentsApiConfig, PaymentsQueryKey, type UserRoleT } from 'common.api';
import { useFetching } from 'common.config';

export const getRolePaymentsQueryKey = (role: UserRoleT) =>
  role === 'tutor' ? PaymentsQueryKey.TutorPayments : PaymentsQueryKey.StudentPayments;

export const useFetchPayments = (
  role: UserRoleT,
  lastOpenedBefore?: string,
  disabled?: boolean,
) => {
  const queryKey = getRolePaymentsQueryKey(role);

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: paymentsApiConfig[queryKey].method,
      getUrl: paymentsApiConfig[queryKey].getUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: lastOpenedBefore ? [queryKey, lastOpenedBefore] : [queryKey],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
