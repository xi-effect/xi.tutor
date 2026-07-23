import { invitationsApiConfig, InvitationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { InvitationDataT } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  createAttemptId,
  mapInviteError,
  measureDurationMs,
  nowMs,
  trackProductEvent,
  type ProductAnalyticsSource,
} from 'common.utils';

type AddInvitationVariables = {
  source?: ProductAnalyticsSource;
};

type AddInvitationContext = {
  attemptId: string;
  startedAt: number;
  source: ProductAnalyticsSource | string;
};

export const useAddInvitation = () => {
  const queryClient = useQueryClient();

  const addInvitationMutation = useMutation<
    { data?: InvitationDataT },
    Error,
    AddInvitationVariables | void,
    AddInvitationContext
  >({
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
    onMutate: (variables) => {
      const attemptId = createAttemptId();
      const startedAt = nowMs();
      const source = variables?.source ?? 'unknown';

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_SUBMIT, {
        attempt_id: attemptId,
        source,
      });

      return { attemptId, startedAt, source };
    },
    onError: (err, _variables, context) => {
      if (context) {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITE_FAILED, {
          attempt_id: context.attemptId,
          source: context.source,
          reason: mapInviteError(err),
          duration_ms: measureDurationMs(context.startedAt),
        });
      }

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
    onSuccess: (response, _variables, context) => {
      const data =
        response && typeof response === 'object' && 'data' in response
          ? (response.data as InvitationDataT | undefined)
          : undefined;

      if (data) {
        const previous = queryClient.getQueryData<InvitationDataT[]>([
          InvitationsQueryKey.AllInvitations,
        ]);
        const isFirstInvite = !previous || previous.length === 0;

        queryClient.setQueryData<InvitationDataT[]>(
          [InvitationsQueryKey.AllInvitations],
          (old: InvitationDataT[] | undefined) => {
            if (!old) return old;
            return [...old, data];
          },
        );

        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.STUDENT_INVITED_SUCCESS, {
          role: 'tutor',
          source: context?.source ?? 'unknown',
          invite_kind: 'student',
          attempt_id: context?.attemptId,
          invite_id: String(data.id),
          duration_ms: context ? measureDurationMs(context.startedAt) : undefined,
          is_first_invite: isFirstInvite,
        });
      }
    },
  });

  return { ...addInvitationMutation };
};
