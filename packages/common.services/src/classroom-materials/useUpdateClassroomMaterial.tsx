/* eslint-disable @typescript-eslint/no-explicit-any */
import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateMaterialDataT } from 'common.types';
import { handleError, showSuccess } from 'common.services';

interface UpdateClassroomMaterialParams {
  classroomId: string;
  id: string;
  data: UpdateMaterialDataT;
}

interface MutationContext {
  previousQueries: [readonly unknown[], unknown][];
}

export const useUpdateClassroomMaterial = () => {
  const queryClient = useQueryClient();

  const updateClassroomMaterialMutation = useMutation<
    any,
    Error,
    UpdateClassroomMaterialParams,
    MutationContext
  >({
    mutationFn: async ({ classroomId, id, data }: UpdateClassroomMaterialParams) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method:
            classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.UpdateClassroomMaterial].method,
          url: classroomMaterialsApiConfig[
            ClassroomMaterialsQueryKey.UpdateClassroomMaterial
          ].getUrl(classroomId, id),
          data,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при обновлении материала кабинета:', err);
        throw err;
      }
    },
    onMutate: async ({ classroomId, id }) => {
      console.log('onMutate update classroom material', classroomId, id);

      // Отменяем все queries для данного материала кабинета
      await queryClient.cancelQueries({
        queryKey: [ClassroomMaterialsQueryKey.GetClassroomMaterial, classroomId, id],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (response, { classroomId, id }) => {
      console.log('onSuccess update classroom material', response, classroomId, id);

      // Инвалидируем queries для данного материала кабинета
      queryClient.invalidateQueries({
        queryKey: [ClassroomMaterialsQueryKey.GetClassroomMaterial, classroomId, id],
      });

      // Также инвалидируем общий список материалов кабинета
      queryClient.invalidateQueries({
        queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials, classroomId],
      });

      showSuccess('materials', 'Материал кабинета обновлен');
    },
  });

  return { updateClassroomMaterial: updateClassroomMaterialMutation };
};
