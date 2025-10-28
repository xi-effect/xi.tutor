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
    onMutate: async (materialsData) => {
      // Отменяем все queries, которые начинаются с [Materials, kind]
      await queryClient.cancelQueries({
        queryKey: [MaterialsQueryKey.Materials, materialsData.content_kind],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({
          queryKey: [MaterialsQueryKey.Materials, response.data.content_kind],
        });
      }

      showSuccess('materials', `${response.data.name} создан`);
    },
  });

  return { addMaterials: addMaterialsMutation };
};
