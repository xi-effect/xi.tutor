import { useMemo } from 'react';
import { AxiosError } from 'axios';
import type { CallsProviderDepsT } from '@xipkg/calls-providers';
import type { StartCallDataT } from '@xipkg/calls-types';
import {
  useCreateTokenByStudent,
  useCreateTokenByTutor,
  useCurrentUser,
  useGetClassroom,
  useGetClassroomMaterialsList,
  useReactivateCall,
  useUpdateConferenceMetadata,
  useUpdateParticipantMetadata,
} from 'common.services';
import { env } from 'common.env';
import { useCallsAddClassroomMaterials } from './useCallsAddClassroomMaterials';
import { PRODUCT_ANALYTICS_EVENTS, getProductAnalyticsRole, trackProductEvent } from 'common.utils';

type AccessTokenResponseT = string | { url: string };

const extractToken = (response: AccessTokenResponseT): string =>
  typeof response === 'string' ? response : response.url;

export const useCallsDeps = (): CallsProviderDepsT => {
  const { createTokenByTutor } = useCreateTokenByTutor();
  const { createTokenByStudent } = useCreateTokenByStudent();
  const { reactivateCall } = useReactivateCall();
  const { updateConferenceMetadata } = useUpdateConferenceMetadata();
  const tutorMetadata = useUpdateParticipantMetadata('tutor');
  const studentMetadata = useUpdateParticipantMetadata('student');
  const { data: user } = useCurrentUser();

  return useMemo(
    () => ({
      auth: {
        useCurrentUser,
      },
      room: {
        useGetClassroom,
        useAddClassroomMaterials: useCallsAddClassroomMaterials,
        useGetClassroomMaterialsList,
      },
      callAuth: {
        createTokenByTutor: async (data: StartCallDataT) => {
          try {
            return extractToken(await createTokenByTutor.mutateAsync(data));
          } catch (error: unknown) {
            // 409 — не финальная ошибка: useStartCall сделает reactivateCall + retry
            if (!(error instanceof AxiosError && error.response?.status === 409)) {
              trackProductEvent(PRODUCT_ANALYTICS_EVENTS.CALL_CONNECTION_FAILED, {
                role: getProductAnalyticsRole(user?.default_layout),
                reason: 'token_error',
              });
            }
            throw error;
          }
        },
        createTokenByStudent: async (data: StartCallDataT) => {
          try {
            return extractToken(await createTokenByStudent.mutateAsync(data));
          } catch (error) {
            trackProductEvent(PRODUCT_ANALYTICS_EVENTS.CALL_CONNECTION_FAILED, {
              role: getProductAnalyticsRole(user?.default_layout),
              reason: 'token_error',
            });
            throw error;
          }
        },
        reactivateCall: async (data: StartCallDataT) => {
          await reactivateCall.mutateAsync(data);
        },
        isLoading:
          createTokenByTutor.isPending ||
          createTokenByStudent.isPending ||
          reactivateCall.isPending,
        error: createTokenByTutor.error ?? createTokenByStudent.error ?? reactivateCall.error,
      },
      updateParticipantMetadata: {
        updateParticipantMetadata: async (data) => {
          const role = data.role ?? user?.default_layout ?? 'student';
          const mutation = role === 'tutor' ? tutorMetadata : studentMetadata;
          await mutation.updateParticipantMetadata.mutateAsync({
            classroom_id: data.classroom_id,
            is_hand_raised: data.is_hand_raised,
          });
        },
        isPending:
          tutorMetadata.updateParticipantMetadata.isPending ||
          studentMetadata.updateParticipantMetadata.isPending,
      },
      conferenceMetadata: {
        updateConferenceMetadata: async (data) => {
          await updateConferenceMetadata.mutateAsync(data);
        },
      },
      appConfig: {
        getClassroomJoinLink: (classroomId) =>
          `${env.VITE_APP_DOMAIN}/classrooms/${classroomId}?tab=overview&goto=call`,
      },
    }),
    [
      createTokenByStudent,
      createTokenByTutor,
      reactivateCall,
      studentMetadata,
      tutorMetadata,
      updateConferenceMetadata,
      user?.default_layout,
    ],
  );
};
