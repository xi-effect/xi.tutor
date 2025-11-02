import { classroomNotesApiConfig, ClassroomNotesQueryKey } from 'common.api';
import { StorageItemT } from 'common.types';
import { useFetching } from 'common.config';

export const useGetNoteStorageItem = ({
  classroomId,
  disabled,
}: {
  classroomId: string;
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
    disabled: disabled,
    queryKey: [ClassroomNotesQueryKey.GetNoteStorageItem, classroomId],
  });

  return {
    data: data as StorageItemT,
    isError,
    isLoading,
    ...rest,
  };
};
