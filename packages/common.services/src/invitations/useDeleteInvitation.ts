import { invitationsApiConfig, invitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  const DeleteInvitationMutation = useMutation({
    mutationFn: async (invitation_id: number) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: invitationsApiConfig[invitationsQueryKey.DeleteInvitation].method,
          url: invitationsApiConfig[invitationsQueryKey.DeleteInvitation].getUrl(invitation_id),
          data: {
            invitation_id,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (err) {
        console.error('Ошибка при обновлении пароля:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [invitationsQueryKey.AllInvitations] });
    },
  });

  return { deleteInvitationConfirm: DeleteInvitationMutation };
};
