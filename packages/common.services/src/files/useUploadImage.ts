import { useMutation } from '@tanstack/react-query';
import type { FileResponse } from 'common.api';
import { handleError } from '..';
import { toast } from 'sonner';
import { uploadFileIdRequest, uploadFileRequest, type UploadFileVars } from './uploadFileRequest';

export type UploadImageVars = UploadFileVars;

/** @deprecated Use uploadFileRequest — бэкенд сам определяет kind. */
export async function uploadImageRequest(vars: UploadImageVars): Promise<string> {
  return uploadFileIdRequest(vars);
}

export const useUploadFile = () => {
  return useMutation<FileResponse, Error, UploadFileVars>({
    mutationFn: uploadFileRequest,
    onSuccess: () => toast('Файл успешно загружен'),
    onError: (err) => handleError(err, 'files'),
  });
};

export const useUploadImage = () => {
  return useMutation<string, Error, UploadImageVars>({
    mutationFn: uploadImageRequest,
    onSuccess: () => toast('Изображение успешно загружено'),
    onError: (err) => handleError(err, 'files'),
  });
};
