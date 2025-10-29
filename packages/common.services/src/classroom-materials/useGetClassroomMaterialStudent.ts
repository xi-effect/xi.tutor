import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { MaterialT } from 'common.types';
import { useFetching } from 'common.config';

export const useGetClassroomMaterialStudent = ({
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
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.GetClassroomMaterialStudent].method,
      getUrl: () =>
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.GetClassroomMaterialStudent].getUrl(
          classroomId,
          id,
        ),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !classroomId || !id,
    queryKey: [ClassroomMaterialsQueryKey.GetClassroomMaterialStudent, classroomId, id],
  });

  return {
    data: data as MaterialT,
    isError,
    isLoading,
    ...rest,
  };
};
