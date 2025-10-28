import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { MaterialT } from 'common.types';
import { useFetching } from 'common.config';

export const useGetClassroomMaterial = (classroomId: string, id: string, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.GetClassroomMaterial].method,
      getUrl: () =>
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.GetClassroomMaterial].getUrl(
          classroomId,
          id,
        ),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !classroomId || !id,
    queryKey: [ClassroomMaterialsQueryKey.GetClassroomMaterial, classroomId, id],
  });

  return {
    data: data as MaterialT,
    isError,
    isLoading,
    ...rest,
  };
};
