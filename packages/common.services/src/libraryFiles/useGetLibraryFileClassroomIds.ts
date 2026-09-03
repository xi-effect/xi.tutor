import { useMemo } from 'react';
import { libraryFilesApiConfig, LibraryFilesQueryKey, libraryFilesQueryKeys } from 'common.api';
import { getAxiosInstance, useFetching } from 'common.config';
import type { QueryClient } from '@tanstack/react-query';

export function parseLibraryFileClassroomIds(data: unknown): number[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const ids: number[] = [];
  const seen = new Set<number>();

  for (const value of data) {
    const id = typeof value === 'number' ? value : Number(value);
    if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
      continue;
    }

    seen.add(id);
    ids.push(id);
  }

  return ids;
}

export function appendLibraryFileClassroomId(
  queryClient: QueryClient,
  fileId: string,
  classroomId: number,
) {
  queryClient.setQueryData<number[]>(libraryFilesQueryKeys.classroomIds(fileId), (current) => {
    const ids = parseLibraryFileClassroomIds(current);
    if (ids.includes(classroomId)) {
      return ids;
    }

    return [...ids, classroomId];
  });
}

export async function getLibraryFileClassroomIdsRequest(fileId: string): Promise<number[]> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFileClassroomIds];

  const response = await axiosInst<unknown>({
    method,
    url: getUrl(fileId),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseLibraryFileClassroomIds(response.data);
}

export const useGetLibraryFileClassroomIds = (fileId: string, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFileClassroomIds].method,
      getUrl: () =>
        libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFileClassroomIds].getUrl(fileId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !fileId,
    queryKey: libraryFilesQueryKeys.classroomIds(fileId),
  });

  const classroomIds = useMemo(() => parseLibraryFileClassroomIds(data), [data]);

  return {
    data: classroomIds,
    isError,
    isLoading,
    ...rest,
  };
};
