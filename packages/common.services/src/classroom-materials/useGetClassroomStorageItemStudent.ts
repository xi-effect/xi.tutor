import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { ContentYDocItem } from 'common.types';
import { useFetching } from 'common.config';

export const useGetClassroomStorageItemStudent = ({
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
      method:
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomStorageItemStudent].method,
      getUrl: () =>
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomStorageItemStudent].getUrl(
          classroomId,
          id,
        ),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !classroomId || !id,
    queryKey: [ClassroomMaterialsQueryKey.ClassroomStorageItemStudent, classroomId, id],
  });

  return {
    data: data as ContentYDocItem,
    isError,
    isLoading,
    ...rest,
  };
};
