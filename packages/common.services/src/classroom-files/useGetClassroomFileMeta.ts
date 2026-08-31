import {
  type LibraryFile,
  classroomFilesApiConfig,
  ClassroomFilesQueryKey,
  classroomFilesQueryKeys,
} from 'common.api';
import { getAxiosInstance, useFetching } from 'common.config';

export async function getClassroomFileMetaRequest(
  classroomId: string,
  fileId: string,
  isTutor: boolean,
): Promise<LibraryFile> {
  const axiosInst = await getAxiosInstance();
  const key = isTutor
    ? ClassroomFilesQueryKey.GetClassroomFileMetaTutor
    : ClassroomFilesQueryKey.GetClassroomFileMetaStudent;
  const { getUrl, method } = classroomFilesApiConfig[key];

  const response = await axiosInst<LibraryFile>({
    method,
    url: getUrl(classroomId, fileId),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export const useGetClassroomFileMeta = (
  classroomId: string,
  fileId: string,
  isTutor: boolean,
  disabled?: boolean,
) => {
  const role = isTutor ? 'tutor' : 'student';
  const key = isTutor
    ? ClassroomFilesQueryKey.GetClassroomFileMetaTutor
    : ClassroomFilesQueryKey.GetClassroomFileMetaStudent;

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: classroomFilesApiConfig[key].method,
      getUrl: () => classroomFilesApiConfig[key].getUrl(classroomId, fileId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !classroomId || !fileId,
    queryKey: classroomFilesQueryKeys.meta(role, classroomId, fileId),
  });

  return {
    data: data as LibraryFile | undefined,
    isError,
    isLoading,
    ...rest,
  };
};
