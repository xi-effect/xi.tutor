import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { ContentYDocItem } from 'common.types';
import { useFetching } from 'common.config';

export const useGetClassroomStorageItem = ({
  classroomId,
  id,
  disabled,
}: {
  classroomId: string;
  id: string;
  disabled?: boolean;
}) => {
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
    data: data as ContentYDocItem,
    isError,
    isLoading,
    ...rest,
  };
};
