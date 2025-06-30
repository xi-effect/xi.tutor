import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  const DeleteInvitationMutation = useMutation({
    mutationFn: async (invitation_id: number) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: invitationsApiConfig[InvitationsQueryKey.DeleteInvitation].method,
          url: invitationsApiConfig[InvitationsQueryKey.DeleteInvitation].getUrl(invitation_id),
          data: {
            invitation_id,
          },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [InvitationsQueryKey.AllInvitations] });
    },
  });

  return { deleteInvitationConfirm: DeleteInvitationMutation };
};
