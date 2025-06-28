import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateNameWithDate } from 'common.utils';

export type MaterialsDataT = {
  kind: 'note' | 'board';
  name?: string;
};

export const useAddMaterials = () => {
  const queryClient = useQueryClient();

  const addMaterialsMutation = useMutation({
    mutationFn: async (materialsData: MaterialsDataT) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: materialsApiConfig[MaterialsQueryKey.Materials].method,
          url: materialsApiConfig[MaterialsQueryKey.Materials].getUrl(),
          data: {
            ...materialsData,
            name: materialsData.name || generateNameWithDate(materialsData.kind),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MaterialsQueryKey.Materials] });
    },
  });

  return { addMaterials: addMaterialsMutation };
};
