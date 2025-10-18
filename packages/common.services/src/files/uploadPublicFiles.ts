import { filesApiConfig, FilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { WORKER_URL } from './const';

export const uploadPublicImage = async (file: File): Promise<string> => {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = filesApiConfig[FilesQueryKey.UploadPublicImage];
  const formData = new FormData();
  formData.append('upload', file);

  const response = await axiosInst({
    method,
    url: getUrl(),
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (response.status !== 201) throw new Error(`File upload failed: ${response.status}`);

  return `${WORKER_URL}${response.data.id}/`;
};
