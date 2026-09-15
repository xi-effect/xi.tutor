import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import {
  type LibraryFile,
  buildLibraryFilePatch,
  libraryFilesApiConfig,
  LibraryFilesQueryKey,
  libraryFilesQueryKeys,
  ClassroomFilesQueryKey,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '../utils';

export type RenameLibraryFileVars = {
  fileId: string;
  name: string;
};

const isLibraryFile = (value: unknown): value is LibraryFile =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof (value as LibraryFile).id === 'string';

const readDetail = (error: AxiosError): string | undefined => {
  const data = error.response?.data;
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const detail = (data as { detail?: unknown }).detail;
    return typeof detail === 'string' ? detail : undefined;
  }
};

export async function renameLibraryFileRequest({
  fileId,
  name,
}: RenameLibraryFileVars): Promise<LibraryFile> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = libraryFilesApiConfig[LibraryFilesQueryKey.UpdateLibraryFile];

  const response = await axiosInst<LibraryFile>({
    method,
    url: getUrl(fileId),
    data: buildLibraryFilePatch(name),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200 || !isLibraryFile(response.data)) {
    throw new Error(`Library file rename failed: ${response.status}`);
  }

  return response.data;
}

const patchLibraryFileName = (
  file: LibraryFile,
  fileId: string,
  updated: LibraryFile,
): LibraryFile => (file.id === fileId ? updated : file);

export const useRenameLibraryFile = () => {
  const queryClient = useQueryClient();

  return useMutation<LibraryFile, Error, RenameLibraryFileVars>({
    mutationFn: renameLibraryFileRequest,
    onError: (err) => {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const detail = readDetail(err);

        if (detail === 'File access denied') {
          toast.error('Нет доступа к этому файлу');
          return;
        }

        if (detail === 'File not found') {
          toast.error('Файл не найден');
          return;
        }

        if (status === 422) {
          toast.error('Название файла не прошло проверку');
          return;
        }
      }

      handleError(err, 'files');
    },
    onSuccess: (updated, { fileId }) => {
      queryClient.setQueriesData<InfiniteData<LibraryFile[]>>(
        { queryKey: [LibraryFilesQueryKey.SearchLibraryFiles] },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) =>
              page.map((file) => patchLibraryFileName(file, fileId, updated)),
            ),
          };
        },
      );

      queryClient.setQueryData<LibraryFile>(libraryFilesQueryKeys.meta(fileId), (current) =>
        current ? patchLibraryFileName(current, fileId, updated) : updated,
      );

      queryClient.setQueriesData<InfiniteData<LibraryFile[]>>(
        { queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesTutor] },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) =>
              page.map((file) => patchLibraryFileName(file, fileId, updated)),
            ),
          };
        },
      );
      queryClient.setQueriesData<InfiniteData<LibraryFile[]>>(
        { queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesStudent] },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) =>
              page.map((file) => patchLibraryFileName(file, fileId, updated)),
            ),
          };
        },
      );
      queryClient.invalidateQueries({
        queryKey: [LibraryFilesQueryKey.SearchLibraryFiles],
      });
      queryClient.invalidateQueries({
        queryKey: libraryFilesQueryKeys.meta(fileId),
      });
      queryClient.invalidateQueries({
        queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesTutor],
      });
      queryClient.invalidateQueries({
        queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesStudent],
      });
    },
  });
};
