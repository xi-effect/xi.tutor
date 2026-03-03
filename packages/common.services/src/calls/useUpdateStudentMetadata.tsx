import { callsApiConfig, CallsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';
import { handleError } from 'common.services';

export type UpdateStudentMetadataT = {
  classroom_id: string;
  is_hand_raised: boolean;
};

export const useUpdateStudentMetadata = () => {
  const updateStudentMetadataMutation = useMutation({
    mutationFn: async (data: UpdateStudentMetadataT) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: callsApiConfig[CallsQueryKey.UpdateStudentMetadata].method,
          url: callsApiConfig[CallsQueryKey.UpdateStudentMetadata].getUrl(data.classroom_id),
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            is_hand_raised: data.is_hand_raised,
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при обновлении метаданных студента:', err);
        throw err;
      }
    },
    onError: (err) => {
      handleError(err, 'calls');
    },
  });

  return { updateStudentMetadata: updateStudentMetadataMutation };
};
