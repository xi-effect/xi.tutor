import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type LibraryFile,
  libraryFilesApiConfig,
  LibraryFilesQueryKey,
  libraryFilesQueryKeys,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '../utils';

export type RenameLibraryFileVars = {
  fileId: string;
  name: string;
};

export async function renameLibraryFileRequest({
  fileId,
  name,
}: RenameLibraryFileVars): Promise<LibraryFile | void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = libraryFilesApiConfig[LibraryFilesQueryKey.UpdateLibraryFile];

  const response = await axiosInst<LibraryFile>({
    method,
    url: getUrl(fileId),
    data: { name },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.data && typeof response.data === 'object' && 'id' in response.data) {
    return response.data;
  }
}

const patchLibraryFileName = (
  file: LibraryFile,
  fileId: string,
  name: string,
  updated?: LibraryFile,
): LibraryFile => {
  if (file.id !== fileId) {
    return file;
  }

  return updated ?? { ...file, name };
};

export const useRenameLibraryFile = () => {
  const queryClient = useQueryClient();

  return useMutation<LibraryFile | void, Error, RenameLibraryFileVars>({
    mutationFn: renameLibraryFileRequest,
    onError: (err) => {
      handleError(err, 'files');
    },
    onSuccess: (updated, { fileId, name }) => {
      queryClient.setQueriesData<InfiniteData<LibraryFile[]>>(
        { queryKey: [LibraryFilesQueryKey.SearchLibraryFiles] },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) =>
              page.map((file) => patchLibraryFileName(file, fileId, name, updated ?? undefined)),
            ),
          };
        },
      );

      queryClient.setQueryData<LibraryFile>(libraryFilesQueryKeys.meta(fileId), (current) =>
        current ? patchLibraryFileName(current, fileId, name, updated ?? undefined) : current,
      );

      queryClient.invalidateQueries({
        queryKey: [LibraryFilesQueryKey.SearchLibraryFiles],
      });
      queryClient.invalidateQueries({
        queryKey: libraryFilesQueryKeys.meta(fileId),
      });
    },
  });
};
