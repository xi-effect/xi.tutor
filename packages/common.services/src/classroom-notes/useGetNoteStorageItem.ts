import { classroomNotesApiConfig, ClassroomNotesQueryKey } from 'common.api';
import { ContentYDocItem } from 'common.types';
import { getAxiosInstance } from 'common.config';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const useGetNoteStorageItem = ({
  classroomId,
  disabled,
}: {
  classroomId: string;
  disabled?: boolean;
}) => {
  const { data, isError, isLoading, ...rest } = useQuery({
    queryKey: [ClassroomNotesQueryKey.GetNoteStorageItem, classroomId],
    enabled: !disabled && Boolean(classroomId),
    queryFn: async () => {
      try {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance({
          method: classroomNotesApiConfig[ClassroomNotesQueryKey.GetNoteStorageItem].method,
          url: classroomNotesApiConfig[ClassroomNotesQueryKey.GetNoteStorageItem].getUrl(
            classroomId,
          ),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data as ContentYDocItem;
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });

  return {
    data: data ?? undefined,
    isError,
    isLoading,
    ...rest,
  };
};
