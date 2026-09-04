import {
  type InfiniteData,
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { type LibraryFile, libraryFilesApiConfig, LibraryFilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError, showSuccess } from '../utils';
import { prepareContentUpload } from '../files/prepareContentUpload';
import { assertValidFileName } from '../files/validateFileName';

export type UploadLibraryFileVars = {
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

export async function uploadLibraryFileRequest({
  file,
  signal,
  onUploadProgress,
}: UploadLibraryFileVars): Promise<LibraryFile> {
  const prepared = prepareContentUpload(file);
  assertValidFileName(prepared.file);

  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = libraryFilesApiConfig[LibraryFilesQueryKey.UploadLibraryFile];
  const formData = new FormData();
  formData.append('upload', prepared.file);

  const response = await axiosInst<LibraryFile>({
    method,
    url: getUrl(),
    data: formData,
    signal,
    headers: {
      'Content-Type': false,
    },
    onUploadProgress: (event) => {
      if (!onUploadProgress || !event.total) {
        return;
      }

      onUploadProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    },
  });

  if (response.status === 415 || response.status === 422) {
    throw new Error('Неподдерживаемый формат файла. Пожалуйста, выберите другой файл.');
  }

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Library file upload failed: ${response.status}`);
  }

  if (!isLibraryFile(response.data)) {
    throw new Error('Library file upload failed: empty response');
  }

  return response.data;
}

export const uploadLibraryFile = (file: File): Promise<LibraryFile> =>
  uploadLibraryFileRequest({ file });

export const insertLibraryFileInSearchCache = (queryClient: QueryClient, uploaded: LibraryFile) => {
  queryClient.setQueriesData<InfiniteData<LibraryFile[]>>(
    { queryKey: [LibraryFilesQueryKey.SearchLibraryFiles] },
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

export const useUploadLibraryFile = () => {
  const queryClient = useQueryClient();

  return useMutation<LibraryFile, Error, File>({
    mutationFn: uploadLibraryFile,
    onError: (err) => {
      handleError(err, 'files');
    },
    onSuccess: (uploaded) => {
      insertLibraryFileInSearchCache(queryClient, uploaded);
      queryClient.invalidateQueries({
        queryKey: [LibraryFilesQueryKey.SearchLibraryFiles],
      });
      showSuccess('files');
    },
  });
};
