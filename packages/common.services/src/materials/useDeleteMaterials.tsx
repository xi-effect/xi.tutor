import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

interface DeleteMaterialsParams {
  id: string;
  content_kind: 'note' | 'board';
  name?: string;
}

interface MutationContext {
  previousQueries: [readonly unknown[], unknown][];
}

const validateKind = (kind: string): kind is DeleteMaterialsParams['content_kind'] => {
  return kind === 'note' || kind === 'board';
};

export const useDeleteMaterials = () => {
  const queryClient = useQueryClient();

  const deleteMaterialsMutation = useMutation<void, Error, DeleteMaterialsParams, MutationContext>({
    mutationFn: async (params: DeleteMaterialsParams) => {
      if (!validateKind(params.content_kind)) {
        throw new Error('Invalid material kind');
      }

      try {
        const axiosInst = await getAxiosInstance();
        await axiosInst({
          method: materialsApiConfig[MaterialsQueryKey.DeleteMaterials].method,
          url: materialsApiConfig[MaterialsQueryKey.DeleteMaterials].getUrl(params.id),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (err) {
        console.error('Ошибка при удалении материалов:', err);
        throw err;
      }
    },
    onMutate: async (params) => {
      console.log('onMutate delete', params);

      // Отменяем все queries, которые начинаются с [Materials, kind]
      await queryClient.cancelQueries({
        queryKey: [MaterialsQueryKey.Materials, params.content_kind],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (_, params) => {
      // Инвалидируем все queries для данного kind, чтобы они перезапросились
      queryClient.invalidateQueries({
        queryKey: [MaterialsQueryKey.Materials, params.content_kind],
      });

      showSuccess('materials', `${params.name || 'Материал'} удален`);
    },
  });

  return { deleteMaterials: deleteMaterialsMutation };
};
