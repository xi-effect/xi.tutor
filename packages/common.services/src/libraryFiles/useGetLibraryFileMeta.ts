import {
  type LibraryFile,
  libraryFilesApiConfig,
  LibraryFilesQueryKey,
  libraryFilesQueryKeys,
} from 'common.api';
import { getAxiosInstance, useFetching } from 'common.config';

export async function getLibraryFileMetaRequest(fileId: string): Promise<LibraryFile> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFileMeta];

  const response = await axiosInst<LibraryFile>({
    method,
    url: getUrl(fileId),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export const useGetLibraryFileMeta = (fileId: string, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFileMeta].method,
      getUrl: () => libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFileMeta].getUrl(fileId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !fileId,
    queryKey: libraryFilesQueryKeys.meta(fileId),
  });

  return {
    data: data as LibraryFile | undefined,
    isError,
    isLoading,
    ...rest,
  };
};
