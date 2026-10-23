import { filesApiConfig, FilesQueryKey, type FileResponse } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { prepareContentUpload } from './prepareContentUpload';
import { assertValidFileName } from './validateFileName';
import { createFileUploadHttpError } from './createFileUploadHttpError';
import {
  invalidateStorageUsage,
  preventStorageWrite,
  reportStorageLimitReached,
} from '../storageLimit/storageLimitReached';

export type UploadFileVars = {
  file: File;
  token?: string;
  signal?: AbortSignal;
  onUploadProgress?: (percent: number) => void;
};

export async function uploadFileRequest({
  file,
  token,
  signal,
  onUploadProgress,
}: UploadFileVars): Promise<FileResponse> {
  preventStorageWrite();
  assertValidFileName(file);

  const prepared = prepareContentUpload(file);
  assertValidFileName(prepared.file);

  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = filesApiConfig[FilesQueryKey.UploadFile];
  const formData = new FormData();
  formData.append('upload', prepared.file);

  const response = await axiosInst({
    method,
    url: getUrl(),
    data: formData,
    signal,
    validateStatus: (status) => status < 500,
    headers: {
      // false: axios не подставляет application/json и не сериализует FormData в JSON.
      'Content-Type': false,
      ...(token ? { 'x-content-token': token } : {}),
    },
    onUploadProgress: (event) => {
      if (!onUploadProgress || !event.total) {
        return;
      }

      onUploadProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    },
  });

  if (response.status === 415 || response.status === 422) {
    throw createFileUploadHttpError(
      response.status,
      'Неподдерживаемый формат файла. Пожалуйста, выберите другой файл.',
      response,
    );
  }

  if (response.status !== 201) {
    const error = createFileUploadHttpError(
      response.status,
      `File upload failed: ${response.status}`,
      response,
    );
    reportStorageLimitReached(error);
    throw error;
  }
  invalidateStorageUsage();
  return response.data as FileResponse;
}

export async function uploadFileIdRequest(vars: UploadFileVars): Promise<string> {
  const uploaded = await uploadFileRequest(vars);
  return uploaded.id;
}
