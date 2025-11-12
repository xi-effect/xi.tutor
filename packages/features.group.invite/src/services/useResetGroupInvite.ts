import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useResetGroupInvite = ({ classroom_id }: { classroom_id: string }) => {
  const queryClient = useQueryClient();

  const resetGroupInviteMutation = useMutation({
    mutationFn: async () => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: invitationsApiConfig[InvitationsQueryKey.ResetGroupInvitation].method,
          url: invitationsApiConfig[InvitationsQueryKey.ResetGroupInvitation].getUrl(classroom_id),
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
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [InvitationsQueryKey.AddGroupInvitation, classroom_id],
      });
    },
  });

  return { ...resetGroupInviteMutation };
};
