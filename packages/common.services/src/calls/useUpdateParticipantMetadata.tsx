import { callsApiConfig, CallsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';
import { handleError } from 'common.services';

type Role = 'student' | 'tutor';

export type UpdateParticipantMetadataT = {
  classroom_id: string;
  is_hand_raised: boolean;
};

export const useUpdateParticipantMetadata = (role: Role) => {
  const queryKey =
    role === 'tutor' ? CallsQueryKey.UpdateTutorMetadata : CallsQueryKey.UpdateStudentMetadata;

  const mutation = useMutation({
    mutationFn: async (data: UpdateParticipantMetadataT) => {
      try {
        const axiosInst = await getAxiosInstance();

        const response = await axiosInst({
          method: callsApiConfig[queryKey].method,
          url: callsApiConfig[queryKey].getUrl(data.classroom_id),
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            is_hand_raised: data.is_hand_raised,
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при обновлении метаданных участника:', err);
        throw err;
      }
    },
    onError: (err) => {
      handleError(err, 'calls');
    },
  });

  return { updateParticipantMetadata: mutation };
};
