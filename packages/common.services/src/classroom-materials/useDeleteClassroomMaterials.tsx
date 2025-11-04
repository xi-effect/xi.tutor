import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

interface DeleteClassroomMaterialsParams {
  classroomId: string;
  id: string;
  content_kind: 'note' | 'board';
  name?: string;
}

interface MutationContext {
  previousQueries: [readonly unknown[], unknown][];
}

const validateKind = (kind: string): kind is DeleteClassroomMaterialsParams['content_kind'] => {
  return kind === 'note' || kind === 'board';
};

export const useDeleteClassroomMaterials = () => {
  const queryClient = useQueryClient();

  const deleteClassroomMaterialsMutation = useMutation<
    void,
    Error,
    DeleteClassroomMaterialsParams,
    MutationContext
  >({
    mutationFn: async (params: DeleteClassroomMaterialsParams) => {
      if (!validateKind(params.content_kind)) {
        throw new Error('Invalid material kind');
      }

      try {
        const axiosInst = await getAxiosInstance();
        await axiosInst({
          method:
            classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.DeleteClassroomMaterials].method,
          url: classroomMaterialsApiConfig[
            ClassroomMaterialsQueryKey.DeleteClassroomMaterials
          ].getUrl(params.classroomId, params.id),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (err) {
        console.error('Ошибка при удалении материалов кабинета:', err);
        throw err;
      }
    },
    onMutate: async (params) => {
      // Отменяем все queries, которые начинаются с [ClassroomMaterials, classroomId, kind]
      await queryClient.cancelQueries({
        queryKey: [
          ClassroomMaterialsQueryKey.ClassroomMaterials,
          params.classroomId,
          params.content_kind,
        ],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (_, params) => {
      // Инвалидируем все queries для данного classroomId и kind, чтобы они перезапросились
      queryClient.invalidateQueries({
        queryKey: [
          ClassroomMaterialsQueryKey.ClassroomMaterials,
          params.classroomId,
          params.content_kind,
        ],
      });

      showSuccess('materials', `${params.name || 'Материал'} удален`);
    },
  });

  return { deleteClassroomMaterials: deleteClassroomMaterialsMutation };
};
