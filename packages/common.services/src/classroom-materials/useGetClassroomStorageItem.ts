import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { StorageItemT } from 'common.types';
import { useFetching } from 'common.config';

export const useGetClassroomStorageItem = (classroomId: string, id: string, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomStorageItem].method,
      getUrl: () =>
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomStorageItem].getUrl(
          classroomId,
          id,
        ),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !classroomId || !id,
    queryKey: [ClassroomMaterialsQueryKey.ClassroomStorageItem, classroomId, id],
  });

  return {
    data: data as StorageItemT,
    isError,
    isLoading,
    ...rest,
  };
};
