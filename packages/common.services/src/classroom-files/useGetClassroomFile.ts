import {
  classroomFilesApiConfig,
  ClassroomFilesQueryKey,
  classroomFilesQueryKeys,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useQuery } from '@tanstack/react-query';
import type {
  GetLibraryFileOptions,
  LibraryFileContentResult,
} from '../libraryFiles/useGetLibraryFile';

function buildConditionalHeaders(options?: GetLibraryFileOptions): Record<string, string> {
  const headers: Record<string, string> = {};
  if (options?.ifNoneMatch) {
    headers['if-none-match'] = options.ifNoneMatch;
  }
  if (options?.ifModifiedSince) {
    headers['if-modified-since'] = options.ifModifiedSince;
  }
  return headers;
}

export async function getClassroomFileRequest(
  classroomId: string,
  fileId: string,
  isTutor: boolean,
  options?: GetLibraryFileOptions,
): Promise<LibraryFileContentResult> {
  const axiosInst = await getAxiosInstance();
  const key = isTutor
    ? ClassroomFilesQueryKey.GetClassroomFileTutor
    : ClassroomFilesQueryKey.GetClassroomFileStudent;
  const { getUrl, method } = classroomFilesApiConfig[key];

  const response = await axiosInst({
    method,
    url: getUrl(classroomId, fileId),
    responseType: 'blob',
    headers: buildConditionalHeaders(options),
    validateStatus: (status) => status === 200 || status === 304,
  });

  if (response.status === 304) {
    return { status: 304, data: null };
  }

  if (response.status !== 200) {
    throw new Error(`Classroom file download failed: ${response.status}`);
  }

  return {
    status: 200,
    data: response.data as Blob,
    etag: response.headers?.etag,
    lastModified: response.headers?.['last-modified'],
  };
}

export const useGetClassroomFile = (
  classroomId: string,
  fileId: string,
  isTutor: boolean,
  options?: GetLibraryFileOptions & { disabled?: boolean },
) => {
  const { disabled, ...conditionalHeaders } = options ?? {};
  const role = isTutor ? 'tutor' : 'student';

  return useQuery({
    queryKey: [
      ...classroomFilesQueryKeys.file(role, classroomId, fileId),
      conditionalHeaders.ifNoneMatch ?? '',
      conditionalHeaders.ifModifiedSince ?? '',
    ],
    queryFn: () => getClassroomFileRequest(classroomId, fileId, isTutor, conditionalHeaders),
    enabled: !disabled && Boolean(classroomId) && Boolean(fileId),
  });
};
