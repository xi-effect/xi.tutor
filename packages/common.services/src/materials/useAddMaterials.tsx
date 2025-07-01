import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateNameWithDate } from 'common.utils';
import { handleError, showSuccess } from 'common.services';

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
          method: materialsApiConfig[MaterialsQueryKey.AddMaterials].method,
          url: materialsApiConfig[MaterialsQueryKey.AddMaterials].getUrl(),
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
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.invalidateQueries({ queryKey: [MaterialsQueryKey.AddMaterials] });
      }

      showSuccess('materials', `${response.data.name} создан`);
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
  });

  return { addMaterials: addMaterialsMutation };
};
