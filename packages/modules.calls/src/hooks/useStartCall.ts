/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCurrentUser } from 'common.services';
import { useReactivateCall } from 'common.services';
import { useCreateTokenByTutor } from 'common.services';
import { useCreateTokenByStudent } from 'common.services';
import { useCallStore } from '../store/callStore';
import { useNavigate } from '@tanstack/react-router';
export interface StartCallData {
  classroom_id: string;
}

export const useStartCall = () => {
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { updateStore } = useCallStore();

  const { reactivateCall } = useReactivateCall();
  const { createTokenByTutor } = useCreateTokenByTutor();
  const { createTokenByStudent } = useCreateTokenByStudent();

  const handleTokenToStartCall = async (data: StartCallData) => {
    const tokenResponse = isTutor
      ? await createTokenByTutor.mutateAsync(data)
      : await createTokenByStudent.mutateAsync(data);

    if (tokenResponse) {
      updateStore('token', tokenResponse);
      navigate({
        to: '/call/$callId',
        params: { callId: data.classroom_id },
      });
    }

    return null;
  };

  const startCall = async (data: StartCallData) => {
    try {
      await handleTokenToStartCall(data);
    } catch (error: any) {
      if (error.response?.status === 409 && isTutor) {
        try {
          await reactivateCall.mutateAsync(data, {
            onSuccess: async () => {
              await handleTokenToStartCall(data);
            },
          });
        } catch (error: any) {
          console.error('Ошибка при реактивировании комнаты:', error);
          throw error;
        }
      }
    }
  };

  const isLoading =
    reactivateCall.isPending || createTokenByTutor.isPending || createTokenByStudent.isPending;

  return {
    startCall,
    isLoading,
    error: reactivateCall.error || createTokenByTutor.error || createTokenByStudent.error,
  };
};
