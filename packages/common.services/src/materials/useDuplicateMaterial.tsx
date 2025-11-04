import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';
import { AccessModeT } from 'common.types';

interface DuplicateMaterialParams {
  classroomId: string;
  name: string;
  student_access_mode: AccessModeT;
  source_id: number;
}

interface DuplicateMaterialResponse {
  data: {
    id: string;
    name: string;
    content_kind: 'note' | 'board';
    createdAt: string;
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
          url: materialsApiConfig[MaterialsQueryKey.MaterialDuplicates].getUrl(params.classroomId),
          data: {
            name: params.name,
            student_access_mode: params.student_access_mode,
            source_id: params.source_id,
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
    onMutate: async () => {
      // Отменяем все queries для материалов кабинета
      await queryClient.cancelQueries({
        queryKey: [MaterialsQueryKey.Materials],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (response) => {
      if (response.data) {
        // Инвалидируем queries для материалов
        queryClient.invalidateQueries({
          queryKey: [MaterialsQueryKey.Materials],
        });
      }

      showSuccess('materials', `${response.data.name} успешно дублирован`);
    },
  });

  return { duplicateMaterial: duplicateMaterialMutation };
};
