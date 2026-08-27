import { filesApiConfig, FilesQueryKey, type FileResponse } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { assertValidFileName } from './validateFileName';

export type UploadPresentationVars = { file: File; token?: string };

export async function uploadPresentationRequest({
  file,
  token,
}: UploadPresentationVars): Promise<string> {
  assertValidFileName(file);

  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = filesApiConfig[FilesQueryKey.UploadPresentation];
  const formData = new FormData();
  formData.append('upload', file);

  const response = await axiosInst({
    method,
    url: getUrl(),
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { 'x-content-token': token } : {}),
    },
  });

  if (response.status !== 201) throw new Error(`Presentation upload failed: ${response.status}`);
  const data = response.data as FileResponse;
  return data.id;
}
