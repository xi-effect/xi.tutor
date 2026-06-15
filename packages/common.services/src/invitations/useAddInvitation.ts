import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { InvitationDataT } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  trackProductEvent,
  type ProductAnalyticsSource,
} from 'common.utils';

type AddInvitationVariables = {
  source?: ProductAnalyticsSource;
};

export const useAddInvitation = () => {
  const queryClient = useQueryClient();

  const addInvitationMutation = useMutation<unknown, Error, AddInvitationVariables | void>({
    mutationFn: async () => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: invitationsApiConfig[InvitationsQueryKey.AddInvitation].method,
          url: invitationsApiConfig[InvitationsQueryKey.AddInvitation].getUrl(),
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
    onError: (err) => {
      const previousInvitations = queryClient.getQueryData<InvitationDataT[]>([
        InvitationsQueryKey.AllInvitations,
      ]);
      if (previousInvitations) {
        queryClient.setQueryData<InvitationDataT[]>(
          [InvitationsQueryKey.AllInvitations],
          previousInvitations,
        );
      }

      handleError(err, 'addInvitation');
    },
    onSuccess: (response, variables) => {
      const data =
        response && typeof response === 'object' && 'data' in response
          ? (response.data as InvitationDataT | undefined)
          : undefined;

      if (data) {
        queryClient.setQueryData<InvitationDataT[]>(
          [InvitationsQueryKey.AllInvitations],
          (old: InvitationDataT[] | undefined) => {
            if (!old) return old;
            return [...old, data];
          },
        );

        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITED_SUCCESS, {
          role: 'tutor',
          source: variables?.source ?? 'unknown',
          invite_kind: 'student',
        });
      }
    },
  });

  return { ...addInvitationMutation };
};
