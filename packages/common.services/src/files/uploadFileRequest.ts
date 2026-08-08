import { filesApiConfig, FilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { assertValidFileName } from './validateFileName';

export type UploadFileVars = { file: File; token?: string };

export async function uploadFileRequest({ file, token }: UploadFileVars): Promise<string> {
  assertValidFileName(file);

  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = filesApiConfig[FilesQueryKey.UploadAttachment];
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

  if (response.status === 422)
    throw new Error('Неподдерживаемый формат файла. Пожалуйста, выберите другой файл.');

  if (response.status !== 201) throw new Error(`File upload failed: ${response.status}`);
  return response.data.id as string;
}
