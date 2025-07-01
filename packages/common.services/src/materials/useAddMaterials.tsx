import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateNameWithDate } from 'common.utils';
import { handleError, showSuccess } from 'common.services';

export type MaterialsDataT = {
  kind: 'note' | 'board';
  name?: string;
  id?: string;
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
    onMutate: async (materialsData) => {
      await queryClient.cancelQueries({ queryKey: [MaterialsQueryKey.AddMaterials] });

      const previousMaterials = queryClient.getQueryData([MaterialsQueryKey.AddMaterials]);

      const newMaterial = {
        ...materialsData,
        name: materialsData.name || generateNameWithDate(materialsData.kind),
      };

      queryClient.setQueryData([MaterialsQueryKey.AddMaterials], (old: MaterialsDataT[] = []) => {
        return [...old, newMaterial];
      });

      return { previousMaterials };
    },
    onError: (err, _materialsData, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData([MaterialsQueryKey.AddMaterials], context.previousMaterials);
      }
      handleError(err, 'materials');
    },
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData([MaterialsQueryKey.AddMaterials], (old: MaterialsDataT[] = []) => {
          return [...old.filter((item) => item.name !== response.data.name), response.data];
        });
      }

      showSuccess('materials', `${response.data.name} создан`);
    },
  });

  return { addMaterials: addMaterialsMutation };
};
