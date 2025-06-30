import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useInvitationsList = () => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: invitationsApiConfig[InvitationsQueryKey.AllInvitations].method,
      getUrl: () => invitationsApiConfig[InvitationsQueryKey.AllInvitations].getUrl(),
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
