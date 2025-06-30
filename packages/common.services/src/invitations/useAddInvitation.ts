import { invitationsApiConfig, invitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useAddInvitation = () => {
  const queryClient = useQueryClient();

  const addInvitationMutation = useMutation({
    mutationFn: async () => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: invitationsApiConfig[invitationsQueryKey.AddInvitation].method,
          url: invitationsApiConfig[invitationsQueryKey.AddInvitation].getUrl(),
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
      queryClient.invalidateQueries({ queryKey: [invitationsQueryKey.AllInvitations] });
    },
  });

  return { addInvitationConfirm: addInvitationMutation };
};
