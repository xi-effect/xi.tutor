import { invitationsApiConfig, invitationsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useInvitationsList = () => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: invitationsApiConfig[invitationsQueryKey.AllInvitations].method,
      getUrl: () => invitationsApiConfig[invitationsQueryKey.AllInvitations].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [invitationsQueryKey.AllInvitations],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
