import { classroomNotesApiConfig, ClassroomNotesQueryKey } from 'common.api';
import { MaterialT } from 'common.types';
import { useFetching } from 'common.config';

export const useGetNoteStorageItem = ({
  classroomId,
  disabled,
}: {
  classroomId: string;
  id: string;
  disabled?: boolean;
}) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: classroomNotesApiConfig[ClassroomNotesQueryKey.GetNoteStorageItem].method,
      getUrl: () =>
        classroomNotesApiConfig[ClassroomNotesQueryKey.GetNoteStorageItem].getUrl(classroomId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !classroomId,
    queryKey: [ClassroomNotesQueryKey.GetNoteStorageItem, classroomId],
  });

  return {
    data: data as MaterialT,
    isError,
    isLoading,
    ...rest,
  };
};
