import { callsApiConfig, CallsQueryKey } from 'common.api';
import { getAxiosInstance, queryClient } from 'common.config';
import { useMutation } from '@tanstack/react-query';
import { handleError } from 'common.services';

export interface ReactivateCallData {
  classroom_id: string;
}

export const useReactivateCall = () => {
  const reactivateCallMutation = useMutation({
    mutationFn: async (data: ReactivateCallData) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: callsApiConfig[CallsQueryKey.ReactivateCall].method,
          url: callsApiConfig[CallsQueryKey.ReactivateCall].getUrl(data.classroom_id),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при создании access token:', err);
        throw err;
      }
    },
    onError: (err) => {
      // Показываем toast с ошибкой
      handleError(err, 'calls');
    },
    onSuccess: (data) => {
      const classroomId = data.classroom_id;
      queryClient.invalidateQueries({
        queryKey: [CallsQueryKey.GetParticipantsTutor, classroomId],
      });
    },
  });

  return { reactivateCall: reactivateCallMutation };
};
