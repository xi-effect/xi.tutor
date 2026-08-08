import type { QueryClient } from '@tanstack/react-query';
import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';

async function fetchClassroomStorageItem(
  classroomId: string,
  boardId: string,
  isTutor: boolean,
): Promise<unknown> {
  const queryKey = isTutor
    ? ClassroomMaterialsQueryKey.ClassroomStorageItem
    : ClassroomMaterialsQueryKey.ClassroomStorageItemStudent;
  const apiConfig = classroomMaterialsApiConfig[queryKey];
  const axiosInstance = await getAxiosInstance();

  const response = await axiosInstance({
    method: apiConfig.method,
    url: apiConfig.getUrl(classroomId, boardId),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export function prefetchBoardStorageItem(
  queryClient: QueryClient,
  classroomId: string,
  boardId: string,
  isTutor: boolean,
): Promise<void> {
  const queryKey = isTutor
    ? [ClassroomMaterialsQueryKey.ClassroomStorageItem, classroomId, boardId]
    : [ClassroomMaterialsQueryKey.ClassroomStorageItemStudent, classroomId, boardId];

  return queryClient
    .prefetchQuery({
      queryKey,
      queryFn: () => fetchClassroomStorageItem(classroomId, boardId, isTutor),
    })
    .then(() => undefined);
}
