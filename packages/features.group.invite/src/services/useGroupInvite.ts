import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useGroupInvite = ({
  classroomId,
  disabled = false,
}: {
  classroomId: string;
  disabled?: boolean;
}) => {
  const { method, getUrl } = invitationsApiConfig[InvitationsQueryKey.AddGroupInvitation];

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method,
      getUrl: () => getUrl(classroomId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [InvitationsQueryKey.AddGroupInvitation, classroomId],
    disabled,
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
