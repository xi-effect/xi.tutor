import { ClassroomMaterialsQueryKey, materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';
import { AccessModeT, MaterialId } from 'common.types';
import i18n from 'i18next';

interface DuplicateMaterialParams {
  classroomId: string;
  name?: string;
  student_access_mode?: AccessModeT;
  source_id: MaterialId;
  should_copy_tags?: boolean;
}

interface DuplicateMaterialResponse {
  data: {
    id: string;
    name?: string;
    content_kind: 'note' | 'board';
    updated_at: string;
    tag_ids?: number[] | null;
  };
}

interface MutationContext {
  previousQueries: [readonly unknown[], unknown][];
}

export const useDuplicateMaterial = () => {
  const queryClient = useQueryClient();

  const duplicateMaterialMutation = useMutation<
    DuplicateMaterialResponse,
    Error,
    DuplicateMaterialParams,
    MutationContext
  >({
    mutationFn: async (params: DuplicateMaterialParams) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: materialsApiConfig[MaterialsQueryKey.MaterialDuplicates].method,
          url: materialsApiConfig[MaterialsQueryKey.MaterialDuplicates].getUrl(
            params.classroomId,
            params.should_copy_tags ?? true,
          ),
          data: {
            source_id: params.source_id,
            ...(params.name ? { name: params.name } : {}),
            ...(params.student_access_mode
              ? { student_access_mode: params.student_access_mode }
              : {}),
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при дублировании материала:', err);
        throw err;
      }
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({
        queryKey: [MaterialsQueryKey.Materials],
      });
      await queryClient.cancelQueries({
        queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials, params.classroomId],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (response, params) => {
      if (response.data) {
        queryClient.invalidateQueries({
          queryKey: [MaterialsQueryKey.Materials],
        });
        queryClient.invalidateQueries({
          queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials, params.classroomId],
        });
      }

      showSuccess('materials', i18n.t('toast.materials.duplicated', { ns: 'commonServices' }));
    },
  });

  return { duplicateMaterial: duplicateMaterialMutation };
};
