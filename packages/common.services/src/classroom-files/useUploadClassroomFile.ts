import {
  type InfiniteData,
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { type LibraryFile, classroomFilesApiConfig, ClassroomFilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError, showSuccess } from '../utils';
import { assertValidFileName } from '../files/validateFileName';

export type UploadClassroomFileVars = {
  classroomId: string;
  file: File;
  signal?: AbortSignal;
  onUploadProgress?: (percent: number) => void;
};

const isLibraryFile = (value: unknown): value is LibraryFile =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof (value as LibraryFile).id === 'string' &&
  'kind' in value;

export async function uploadClassroomFileRequest({
  classroomId,
  file,
  signal,
  onUploadProgress,
}: UploadClassroomFileVars): Promise<LibraryFile> {
  assertValidFileName(file);

  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = classroomFilesApiConfig[ClassroomFilesQueryKey.UploadClassroomFile];
  const formData = new FormData();
  formData.append('upload', file);

  const response = await axiosInst<LibraryFile>({
    method,
    url: getUrl(classroomId),
    data: formData,
    signal,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (!onUploadProgress || !event.total) {
        return;
      }
      onUploadProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Classroom file upload failed: ${response.status}`);
  }

  if (!isLibraryFile(response.data)) {
    throw new Error('Classroom file upload failed: empty response');
  }

  return response.data;
}

export const insertClassroomFileInSearchCache = (
  queryClient: QueryClient,
  classroomId: string,
  uploaded: LibraryFile,
) => {
  queryClient.setQueriesData<InfiniteData<LibraryFile[]>>(
    { queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesTutor, classroomId] },
    (current) => {
      if (!current) {
        return current;
      }

      const alreadyListed = current.pages.some((page) =>
        page.some((item) => item.id === uploaded.id),
      );
      if (alreadyListed) {
        return current;
      }

      const [firstPage = [], ...restPages] = current.pages;
      return {
        ...current,
        pages: [[uploaded, ...firstPage], ...restPages],
      };
    },
  );
};

export const invalidateClassroomFiles = (queryClient: QueryClient, classroomId: string) => {
  queryClient.invalidateQueries({
    queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesTutor, classroomId],
  });
  queryClient.invalidateQueries({
    queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesStudent, classroomId],
  });
};

export const useUploadClassroomFile = () => {
  const queryClient = useQueryClient();

  return useMutation<LibraryFile, Error, UploadClassroomFileVars>({
    mutationFn: uploadClassroomFileRequest,
    onError: (err) => {
      handleError(err, 'files');
    },
    onSuccess: (uploaded, { classroomId }) => {
      insertClassroomFileInSearchCache(queryClient, classroomId, uploaded);
      invalidateClassroomFiles(queryClient, classroomId);
      showSuccess('files');
    },
  });
};
