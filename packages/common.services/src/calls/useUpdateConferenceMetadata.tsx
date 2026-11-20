import { callsApiConfig, CallsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';
import { handleError } from 'common.services';

export type ConferenceMaterialKind = 'board' | 'note';

/** Совпадает с ActiveMaterialSchema: UUID материала и его тип. */
export interface ActiveMaterial {
  id: string;
  content_kind: ConferenceMaterialKind;
}

export interface UpdateConferenceMetadataData {
  classroom_id: string;
  active_material: ActiveMaterial | null;
}

export const useUpdateConferenceMetadata = () => {
  const updateConferenceMetadataMutation = useMutation({
    mutationFn: async (data: UpdateConferenceMetadataData) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: callsApiConfig[CallsQueryKey.UpdateConferenceMetadata].method,
          url: callsApiConfig[CallsQueryKey.UpdateConferenceMetadata].getUrl(data.classroom_id),
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            active_material: data.active_material,
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при обновлении метаданных конференции:', err);
        throw err;
      }
    },
    onError: (err) => {
      handleError(err, 'calls');
    },
  });

  return { updateConferenceMetadata: updateConferenceMetadataMutation };
};
