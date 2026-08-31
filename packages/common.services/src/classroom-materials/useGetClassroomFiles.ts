import { useSearchClassroomFiles } from '../classroom-files/useSearchClassroomFiles';
import type { FileFilters } from 'common.api';

type UseGetClassroomFilesParams = {
  classroomId: string;
  isTutor: boolean;
  disabled?: boolean;
  filters?: FileFilters | null;
};

export const useGetClassroomFiles = ({
  classroomId,
  isTutor,
  disabled = false,
  filters,
}: UseGetClassroomFilesParams) => {
  const search = useSearchClassroomFiles({
    classroomId,
    isTutor,
    enabled: !disabled && Boolean(classroomId),
    filters,
  });

  return {
    files: search.files,
    isLoading: search.isLoading,
    isError: search.isError,
    fetchNextPage: search.fetchNextPage,
    hasNextPage: search.hasNextPage,
    isFetchingNextPage: search.isFetchingNextPage,
    refetch: search.refetch,
  };
};
