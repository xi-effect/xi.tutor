import { useMutation } from '@tanstack/react-query';
import { filesApiConfig, FilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '..';
import { toast } from 'sonner';

export type UploadImageVars = { file: File; token?: string };

export async function uploadImageRequest({ file, token }: UploadImageVars): Promise<string> {
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

  if (response.status !== 201) throw new Error(`Image upload failed: ${response.status}`);
  return `${filesApiConfig[FilesQueryKey.GetFile].getUrl(response.data.id)}`;
}

export const useUploadImage = () => {
  return useMutation<string, Error, UploadImageVars>({
    mutationFn: uploadImageRequest,
    onSuccess: () => toast('Изображение успешно загружено'),
    onError: (err) => handleError(err, 'files'),
  });
};
