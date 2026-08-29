import { useEffect, useMemo } from 'react';
import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';
import {
  classroomsApiConfig,
  ClassroomsQueryKey,
  ClassroomT,
  getClassroomDisplayName,
} from 'common.api';
import { getAxiosInstance } from 'common.config';

const PAGE_SIZE = 50;

export const useAllTutorClassrooms = (enabled = true) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useTanStackInfiniteQuery({
      queryKey: [ClassroomsQueryKey.GetClassrooms, 'materials-filter'],
      queryFn: async ({ pageParam }) => {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: classroomsApiConfig[ClassroomsQueryKey.GetClassrooms].method,
          url: classroomsApiConfig[ClassroomsQueryKey.GetClassrooms].getUrl(),
          params: {
            limit: PAGE_SIZE,
            created_before: pageParam,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data as ClassroomT[];
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length < PAGE_SIZE) {
          return undefined;
        }

        return lastPage[lastPage.length - 1]?.created_at;
      },
      enabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

  useEffect(() => {
    if (!enabled || !hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage();
  }, [enabled, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const classrooms = useMemo(() => {
    const flattened = data?.pages.flat() ?? [];
    const seen = new Set<number>();

    return flattened
      .filter((classroom) => {
        if (!classroom?.id || seen.has(classroom.id)) {
          return false;
        }
        seen.add(classroom.id);
        return true;
      })
      .sort((a, b) =>
        getClassroomDisplayName(a).localeCompare(getClassroomDisplayName(b), 'ru', {
          sensitivity: 'base',
        }),
      );
  }, [data?.pages]);

  return {
    classrooms,
    isLoading,
    isError,
  };
};
