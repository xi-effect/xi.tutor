import { useMutation } from '@tanstack/react-query';
import { filesApiConfig, FilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '..';
import { toast } from 'sonner';

export type UploadFileVars = { file: File; token?: string };

export async function uploadFileRequest({ file, token }: UploadFileVars): Promise<string> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = filesApiConfig[FilesQueryKey.UploadImage];
  const formData = new FormData();
  formData.append('upload', file);

  const response = await axiosInst({
    method,
    url: getUrl(),
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { 'x-storage-token': token } : {}),
    },
  });

  if (response.status !== 201) throw new Error(`File upload failed: ${response.status}`);
  return `${filesApiConfig[FilesQueryKey.GetFile].getUrl(response.data.id)}`;
}

export const useUploadFile = () => {
  return useMutation<string, Error, UploadFileVars>({
    mutationFn: uploadFileRequest,
    onSuccess: () => toast('Файл успешно загружен'),
    onError: (err) => handleError(err, 'files'),
  });
};
