import { callsApiConfig, CallsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';
import { handleError } from 'common.services';

export type UpdateTutorMetadataT = {
  classroom_id: string;
  is_hand_raised: boolean;
};

export const useUpdateTutorMetadata = () => {
  const updateTutorMetadataMutation = useMutation({
    mutationFn: async (data: UpdateTutorMetadataT) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: callsApiConfig[CallsQueryKey.UpdateTutorMetadata].method,
          url: callsApiConfig[CallsQueryKey.UpdateTutorMetadata].getUrl(data.classroom_id),
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            is_hand_raised: data.is_hand_raised,
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при обновлении метаданных преподавателя:', err);
        throw err;
      }
    },
    onError: (err) => {
      handleError(err, 'calls');
    },
  });

  return { updateTutorMetadata: updateTutorMetadataMutation };
};
