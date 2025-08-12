import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useInvitationsList = () => {
  const { method, getUrl } = invitationsApiConfig[InvitationsQueryKey.AllInvitations];

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method,
      getUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [InvitationsQueryKey.AllInvitations],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
