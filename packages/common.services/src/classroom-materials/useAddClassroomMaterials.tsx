import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateNameWithDate } from 'common.utils';
import { handleError, showSuccess } from 'common.services';

enum ClassroomMaterialsKind {
  note = 'заметка',
  board = 'доска',
}

interface ClassroomMaterialsResponseT {
  data: ClassroomMaterialsDataT & {
    id: string;
    createdAt: string;
  };
}

interface MutationContext {
  previousQueries: [readonly unknown[], unknown][];
}

export type ClassroomMaterialsDataT = {
  content_kind: 'note' | 'board';
  name?: string;
  student_access_mode?: 'no_access' | 'read_only' | 'read_write';
};

const validateKind = (kind: string): kind is ClassroomMaterialsDataT['content_kind'] => {
  return kind === 'note' || kind === 'board';
};

export const useAddClassroomMaterials = () => {
  const queryClient = useQueryClient();

  const addClassroomMaterialsMutation = useMutation<
    ClassroomMaterialsResponseT,
    Error,
    ClassroomMaterialsDataT & { classroomId: string },
    MutationContext
  >({
    mutationFn: async (materialsData: ClassroomMaterialsDataT & { classroomId: string }) => {
      if (!validateKind(materialsData.content_kind)) {
        throw new Error('Invalid material kind');
      }

      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method:
            classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.AddClassroomMaterials].method,
          url: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.AddClassroomMaterials].getUrl(
            materialsData.classroomId,
          ),
          data: {
            content_kind: materialsData.content_kind,
            name:
              materialsData.name ||
              generateNameWithDate(ClassroomMaterialsKind[materialsData.content_kind]),
            student_access_mode: materialsData.student_access_mode || 'no_access',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при добавлении материалов кабинета:', err);
        throw err;
      }
    },
    onMutate: async (materialsData) => {
      // Отменяем все queries для материалов кабинета
      await queryClient.cancelQueries({
        queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials, materialsData.classroomId],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (response, materialsData) => {
      if (response.data) {
        // Инвалидируем все queries для материалов кабинета
        queryClient.invalidateQueries({
          queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials, materialsData.classroomId],
        });
      }

      showSuccess('materials', `${response.data.name} создан`);
    },
  });

  return { addClassroomMaterials: addClassroomMaterialsMutation };
};
