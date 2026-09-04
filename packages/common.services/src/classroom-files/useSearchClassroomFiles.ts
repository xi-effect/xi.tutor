import {
  LIBRARY_FILES_DEFAULT_LIMIT,
  type LibraryFile,
  type FileCursor,
  type FileFilters,
  buildFileSearchRequest,
  classroomFilesApiConfig,
  ClassroomFilesQueryKey,
  classroomFilesQueryKeys,
  getNextLibraryFilesCursor,
  normalizeLibraryFilesLimit,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useInfiniteQuery } from '@tanstack/react-query';

type ClassroomFilesRole = 'tutor' | 'student';

type SearchClassroomFilesParams = {
  classroomId: string;
  isTutor: boolean;
  limit?: number;
  enabled?: boolean;
  filters?: FileFilters | null;
};

const searchKey = (isTutor: boolean) =>
  isTutor
    ? ClassroomFilesQueryKey.SearchClassroomFilesTutor
    : ClassroomFilesQueryKey.SearchClassroomFilesStudent;

export async function searchClassroomFilesRequest(
  classroomId: string,
  isTutor: boolean,
  cursor: FileCursor | null,
  limit?: number,
  filters?: FileFilters | null,
): Promise<LibraryFile[]> {
  const axiosInst = await getAxiosInstance();
  const key = searchKey(isTutor);
  const request = buildFileSearchRequest(cursor, limit, filters);

  const response = await axiosInst<LibraryFile[]>({
    method: classroomFilesApiConfig[key].method,
    url: classroomFilesApiConfig[key].getUrl(classroomId),
    data: request,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return Array.isArray(response.data) ? response.data : [];
}

export const useSearchClassroomFiles = ({
  classroomId,
  isTutor,
  limit = LIBRARY_FILES_DEFAULT_LIMIT,
  enabled = true,
  filters,
}: SearchClassroomFilesParams) => {
  const normalizedLimit = normalizeLibraryFilesLimit(limit);
  const role: ClassroomFilesRole = isTutor ? 'tutor' : 'student';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    ...rest
  } = useInfiniteQuery<LibraryFile[]>({
    queryKey: classroomFilesQueryKeys.search(role, classroomId, normalizedLimit, filters),
    queryFn: async ({ pageParam }) =>
      searchClassroomFilesRequest(
        classroomId,
        isTutor,
        (pageParam as FileCursor | undefined) ?? null,
        normalizedLimit,
        filters,
      ),
    initialPageParam: undefined as FileCursor | undefined,
    getNextPageParam: (lastPage) => getNextLibraryFilesCursor(lastPage, normalizedLimit),
    enabled: enabled && Boolean(classroomId),
  });

  const files: LibraryFile[] =
    data?.pages.flatMap((page) => (Array.isArray(page) ? page : [])) || [];

  return {
    files,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    refetch,
    ...rest,
  };
};
