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

  const startCall = async (data: StartCallData) => {
    try {
      // 1. Сначала реактивируем комнату (только для репетитора)
      if (isTutor) {
        await reactivateCall.mutateAsync(data);
      }

      // 2. Создаем токен в зависимости от роли
      const tokenResponse = isTutor
        ? await createTokenByTutor.mutateAsync(data)
        : await createTokenByStudent.mutateAsync(data);

      if (tokenResponse) {
        updateStore('token', tokenResponse);

        navigate({
          to: '/call/$classroomId',
          params: { classroomId: data.classroom_id },
        });
      }

      // 3. Сохраняем токен в store

      return tokenResponse;
    } catch (error) {
      console.error('Ошибка при запуске звонка:', error);
      throw error;
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
