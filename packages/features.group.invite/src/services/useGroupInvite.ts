import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { InvitationDataT } from 'common.types';

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
    data: data as InvitationDataT | null | undefined,
    isError,
    isLoading,
    ...rest,
  };
};
