import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateNameWithDate } from 'common.utils';
import { handleError, showSuccess } from 'common.services';

enum MaterialsKind {
  note = 'заметка',
  board = 'доска',
}

interface MaterialsResponseT {
  data: MaterialsDataT & {
    id: string;
    createdAt: string;
  };
}

interface MutationContext {
  previousQueries: [readonly unknown[], unknown][];
}

export type MaterialsDataT = {
  content_kind: 'note' | 'board';
  name?: string;
};

const validateKind = (kind: string): kind is MaterialsDataT['content_kind'] => {
  return kind === 'note' || kind === 'board';
};

export const useAddMaterials = () => {
  const queryClient = useQueryClient();

  const addMaterialsMutation = useMutation<
    MaterialsResponseT,
    Error,
    MaterialsDataT,
    MutationContext
  >({
    mutationFn: async (materialsData: MaterialsDataT) => {
      if (!validateKind(materialsData.content_kind)) {
        throw new Error('Invalid material kind');
      }

      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: materialsApiConfig[MaterialsQueryKey.AddMaterials].method,
          url: materialsApiConfig[MaterialsQueryKey.AddMaterials].getUrl(),
          data: {
            ...materialsData,
            name:
              materialsData.name || generateNameWithDate(MaterialsKind[materialsData.content_kind]),
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при добавлении материалов:', err);
        throw err;
      }
    },
    onMutate: async () => {
      // Отменяем все queries, которые начинаются с [Materials]
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
        // Инвалидируем все запросы материалов, включая список с 'all'
        queryClient.invalidateQueries({
          queryKey: [MaterialsQueryKey.Materials],
        });
      }

      showSuccess('materials', `${response.data.name} создан`);
    },
  });

  return { addMaterials: addMaterialsMutation };
};
