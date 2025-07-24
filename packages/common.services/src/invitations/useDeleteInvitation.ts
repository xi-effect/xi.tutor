import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { InvitationDataT } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitation_id: InvitationDataT['id']) => {
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
    onMutate: async (invitation_id) => {
      await queryClient.cancelQueries({ queryKey: [InvitationsQueryKey.AllInvitations] });

      const previousInvitations = queryClient.getQueryData<InvitationDataT[]>([
        InvitationsQueryKey.AllInvitations,
      ]);

      queryClient.setQueryData<InvitationDataT[]>(
        [InvitationsQueryKey.AllInvitations],
        (old: InvitationDataT[] | undefined) => {
          if (!old) return old;
          return old.filter((invitation: InvitationDataT) => invitation.id !== invitation_id);
        },
      );

      return { previousInvitations };
    },
    onError: (err, _invitation_id, context) => {
      if (context?.previousInvitations) {
        queryClient.setQueryData<InvitationDataT[]>(
          [InvitationsQueryKey.AllInvitations],
          context.previousInvitations,
        );
      }

      handleError(err, 'deleteInvitation');
    },
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData<InvitationDataT[]>(
          [InvitationsQueryKey.AllInvitations],
          response.data,
        );
      }
    },
  });

  return { ...deleteInvitationMutation };
};
