import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess, findNextAvailableName } from 'common.services';

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

      let materialName = materialsData.name;

      if (!materialName) {
        const queries = queryClient.getQueriesData<
          | { pages: Array<Array<{ name: string; content_kind: string }>> }
          | Array<{ name: string; content_kind: string }>
        >({
          queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials, materialsData.classroomId],
        });

        const existingMaterials: Array<{ name: string }> = [];
        queries.forEach(([queryKey, data]) => {
          if (data) {
            const keyType = queryKey[2];
            const isRelevantCache =
              keyType === materialsData.content_kind || keyType === 'all' || keyType === null;

            if (!isRelevantCache) {
              return;
            }

            if ('pages' in data && data.pages) {
              data.pages.forEach((page) => {
                if (Array.isArray(page)) {
                  const filteredMaterials = page.filter(
                    (material) => material.content_kind === materialsData.content_kind,
                  );
                  existingMaterials.push(...filteredMaterials);
                }
              });
            } else if (Array.isArray(data)) {
              const filteredMaterials = data.filter(
                (material) => material.content_kind === materialsData.content_kind,
              );
              existingMaterials.push(...filteredMaterials);
            }
          }
        });

        materialName = findNextAvailableName(existingMaterials, materialsData.content_kind);
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
            name: materialName,
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

      showSuccess('materials', `${response.data.name} создана`);
    },
  });

  return { addClassroomMaterials: addClassroomMaterialsMutation };
};
