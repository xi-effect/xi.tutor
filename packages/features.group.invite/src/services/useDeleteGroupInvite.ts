import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';

export const useDeleteGroupInvite = ({ classroom_id }: { classroom_id: string }) => {
  const deleteGroupInviteMutation = useMutation({
    mutationFn: async () => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: invitationsApiConfig[InvitationsQueryKey.DeleteGroupInvitation].method,
          url: invitationsApiConfig[InvitationsQueryKey.DeleteGroupInvitation].getUrl(classroom_id),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (err) {
        console.error('Ошибка:', err);
        throw err;
      }
    },
  });

  return { ...deleteGroupInviteMutation };
};
