import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PRODUCT_ANALYTICS_EVENTS,
  trackProductEvent,
  type ProductAnalyticsSource,
} from 'common.utils';

type ResetGroupInviteVariables = {
  source?: ProductAnalyticsSource;
};

export const useResetGroupInvite = ({ classroom_id }: { classroom_id: string }) => {
  const queryClient = useQueryClient();

  const resetGroupInviteMutation = useMutation<unknown, Error, ResetGroupInviteVariables | void>({
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
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [InvitationsQueryKey.AddGroupInvitation, classroom_id],
      });

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITED_SUCCESS, {
        role: 'tutor',
        source: variables?.source ?? 'classroom',
        invite_kind: 'group',
      });
    },
  });

  return { ...resetGroupInviteMutation };
};
