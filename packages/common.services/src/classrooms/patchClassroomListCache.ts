import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { ClassroomsQueryKey, classroomStatusesFromQueryKey, type ClassroomT } from 'common.api';

type InfiniteClassroomData = {
  pages: ClassroomT[][];
  pageParams: unknown[];
};

const isInfiniteClassroomData = (data: unknown): data is InfiniteClassroomData =>
  typeof data === 'object' &&
  data !== null &&
  'pages' in data &&
  Array.isArray((data as InfiniteClassroomData).pages);

const mapClassroomListData = (
  data: unknown,
  mapItem: (classroom: ClassroomT) => ClassroomT | null,
): unknown => {
  if (isInfiniteClassroomData(data)) {
    return {
      ...data,
      pages: data.pages.map((page) =>
        page.flatMap((classroom) => {
          const next = mapItem(classroom);
          return next ? [next] : [];
        }),
      ),
    };
  }

  if (!Array.isArray(data)) {
    return data;
  }

  return data.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('id' in item)) {
      return [item];
    }

    const next = mapItem(item as ClassroomT);
    return next ? [next] : [];
  });
};

export const snapshotClassroomLists = (queryClient: QueryClient) =>
  queryClient.getQueriesData({ queryKey: [ClassroomsQueryKey.GetClassrooms] });

export const restoreClassroomLists = (
  queryClient: QueryClient,
  snapshot: Array<[QueryKey, unknown]>,
) => {
  snapshot.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
};

export const patchClassroomInLists = (
  queryClient: QueryClient,
  classroomId: number,
  patch: Partial<ClassroomT>,
) => {
  queryClient
    .getQueryCache()
    .findAll({ queryKey: [ClassroomsQueryKey.GetClassrooms] })
    .forEach((query) => {
      queryClient.setQueryData(query.queryKey, (old) =>
        mapClassroomListData(old, (classroom) => {
          if (classroom.id !== classroomId) {
            return classroom;
          }

          const next = { ...classroom, ...patch } as ClassroomT;
          const allowed = classroomStatusesFromQueryKey(query.queryKey);
          if (allowed && patch.status && !allowed.includes(patch.status)) {
            return null;
          }

          return next;
        }),
      );
    });
};
