import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateNameWithDate } from 'common.utils';
import { handleError, showSuccess } from 'common.services';

interface MaterialsResponseT {
  data: MaterialsDataT & {
    id: string;
    createdAt: string;
  };
}

interface MutationContext {
  previousMaterials: MaterialsDataT[] | undefined;
}

export type MaterialsDataT = {
  kind: 'note' | 'board';
  name?: string;
};

const validateKind = (kind: string): kind is MaterialsDataT['kind'] => {
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
      if (!validateKind(materialsData.kind)) {
        throw new Error('Invalid material kind');
      }

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
      await queryClient.cancelQueries({
        queryKey: [MaterialsQueryKey.Materials, materialsData.kind],
      });

      const previousMaterials = queryClient.getQueryData<MaterialsDataT[]>([
        MaterialsQueryKey.Materials,
        materialsData.kind,
      ]);

      const newMaterial = {
        ...materialsData,
        name: materialsData.name || generateNameWithDate(materialsData.kind),
      };

      queryClient.setQueryData<MaterialsDataT[]>(
        [MaterialsQueryKey.Materials, materialsData.kind],
        (old = []) => [...old, newMaterial],
      );

      return { previousMaterials };
    },
    onError: (err, materialsData, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData(
          [MaterialsQueryKey.Materials, materialsData.kind],
          context.previousMaterials,
        );
      }
      handleError(err, 'materials');
    },
    onSuccess: (response, materialsData) => {
      queryClient.setQueryData<MaterialsDataT[]>(
        [MaterialsQueryKey.Materials, materialsData.kind],
        (old = []) => {
          return [...old.filter((item) => item.name !== response.data.name), response.data];
        },
      );

      showSuccess('materials', `${response.data.name} создан`);
    },
  });

  return { addMaterials: addMaterialsMutation };
};
