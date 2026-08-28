import {
  LIBRARY_FILES_DEFAULT_LIMIT,
  type LibraryFile,
  type FileCursor,
  libraryFilesApiConfig,
  LibraryFilesQueryKey,
  libraryFilesQueryKeys,
  buildFileSearchRequest,
  getNextLibraryFilesCursor,
  normalizeLibraryFilesLimit,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseSearchLibraryFilesProps {
  limit?: number;
  enabled?: boolean;
}

export async function searchLibraryFilesRequest(
  cursor: FileCursor | null,
  limit?: number,
): Promise<LibraryFile[]> {
  const axiosInst = await getAxiosInstance();
  const request = buildFileSearchRequest(cursor, limit);

  const response = await axiosInst<LibraryFile[]>({
    method: libraryFilesApiConfig[LibraryFilesQueryKey.SearchLibraryFiles].method,
    url: libraryFilesApiConfig[LibraryFilesQueryKey.SearchLibraryFiles].getUrl(),
    data: request,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return Array.isArray(response.data) ? response.data : [];
}

export const useSearchLibraryFiles = ({
  limit = LIBRARY_FILES_DEFAULT_LIMIT,
  enabled = true,
}: UseSearchLibraryFilesProps = {}) => {
  const normalizedLimit = normalizeLibraryFilesLimit(limit);

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
    queryKey: libraryFilesQueryKeys.search(normalizedLimit),
    queryFn: async ({ pageParam }) =>
      searchLibraryFilesRequest((pageParam as FileCursor | undefined) ?? null, normalizedLimit),
    initialPageParam: undefined as FileCursor | undefined,
    getNextPageParam: (lastPage) => getNextLibraryFilesCursor(lastPage, normalizedLimit),
    enabled,
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
