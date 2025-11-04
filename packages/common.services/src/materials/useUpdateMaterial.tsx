/* eslint-disable @typescript-eslint/no-explicit-any */
import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateMaterialDataT } from 'common.types';
import { handleError, showSuccess } from 'common.services';

interface UpdateMaterialParams {
  id: string;
  data: UpdateMaterialDataT;
}

interface MutationContext {
  previousQueries: [readonly unknown[], unknown][];
}

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  const updateMaterialMutation = useMutation<any, Error, UpdateMaterialParams, MutationContext>({
    mutationFn: async ({ id, data }: UpdateMaterialParams) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: materialsApiConfig[MaterialsQueryKey.UpdateMaterial].method,
          url: materialsApiConfig[MaterialsQueryKey.UpdateMaterial].getUrl(id),
          data,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при обновлении материала:', err);
        throw err;
      }
    },
    onMutate: async ({ id }) => {
      // Отменяем все queries для данного материала
      await queryClient.cancelQueries({
        queryKey: [MaterialsQueryKey.GetMaterial, id],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (response, { id }) => {
      console.log('onSuccess update material', response, id);

      // Инвалидируем queries для данного материала
      queryClient.invalidateQueries({
        queryKey: [MaterialsQueryKey.GetMaterial, id],
      });

      // Также инвалидируем общий список материалов
      queryClient.invalidateQueries({
        queryKey: [MaterialsQueryKey.Materials],
      });

      showSuccess('materials', 'Материал обновлен');
    },
  });

  return { updateMaterial: updateMaterialMutation };
};
