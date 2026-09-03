import { libraryFilesApiConfig, LibraryFilesQueryKey, libraryFilesQueryKeys } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useQuery } from '@tanstack/react-query';

export type GetLibraryFileOptions = {
  ifNoneMatch?: string;
  ifModifiedSince?: string | null;
};

export type LibraryFileContentResult =
  { status: 200; data: Blob; etag?: string; lastModified?: string } | { status: 304; data: null };

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

export async function getLibraryFileRequest(
  fileId: string,
  options?: GetLibraryFileOptions,
): Promise<LibraryFileContentResult> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFile];

  const response = await axiosInst({
    method,
    url: getUrl(fileId),
    responseType: 'blob',
    headers: buildConditionalHeaders(options),
    validateStatus: (status) => status === 200 || status === 304,
  });

  if (response.status === 304) {
    return { status: 304, data: null };
  }

  if (response.status !== 200) {
    throw new Error(`Library file download failed: ${response.status}`);
  }

  return {
    status: 200,
    data: response.data as Blob,
    etag: response.headers?.etag,
    lastModified: response.headers?.['last-modified'],
  };
}

export const useGetLibraryFile = (
  fileId: string,
  options?: GetLibraryFileOptions & { disabled?: boolean },
) => {
  const { disabled, ...conditionalHeaders } = options ?? {};

  return useQuery({
    queryKey: [
      ...libraryFilesQueryKeys.file(fileId),
      conditionalHeaders.ifNoneMatch ?? '',
      conditionalHeaders.ifModifiedSince ?? '',
    ],
    queryFn: () => getLibraryFileRequest(fileId, conditionalHeaders),
    enabled: !disabled && Boolean(fileId),
  });
};
