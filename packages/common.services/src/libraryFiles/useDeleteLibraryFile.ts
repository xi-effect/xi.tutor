import { libraryFilesApiConfig, LibraryFilesQueryKey, libraryFilesQueryKeys } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils';

export async function deleteLibraryFileRequest(fileId: string): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = libraryFilesApiConfig[LibraryFilesQueryKey.DeleteLibraryFile];

  const response = await axiosInst({
    method,
    url: getUrl(fileId),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 204) {
    throw new Error(`Library file delete failed: ${response.status}`);
  }
}

export const useDeleteLibraryFile = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteLibraryFileRequest,
    onError: (err) => {
      handleError(err, 'files');
    },
    onSuccess: (_data, fileId) => {
      queryClient.invalidateQueries({
        queryKey: [LibraryFilesQueryKey.SearchLibraryFiles],
      });
      queryClient.removeQueries({
        queryKey: libraryFilesQueryKeys.meta(fileId),
      });
      queryClient.removeQueries({
        queryKey: libraryFilesQueryKeys.file(fileId),
      });
    },
  });
};
