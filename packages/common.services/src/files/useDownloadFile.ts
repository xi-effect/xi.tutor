import { getAxiosInstance } from 'common.config';
import { filesApiConfig, FilesQueryKey } from 'common.api';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { handleError } from '..';

export type DownloadFileVars = {
  fileId: string;
  fileName: string;
  token: string;
};

export async function downloadFileRequest({
  fileId,
  fileName,
  token,
}: DownloadFileVars): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = filesApiConfig[FilesQueryKey.GetFile];

  const response = await axiosInst({
    method,
    url: getUrl(fileId),
    responseType: 'blob',
    headers: {
      ...{ 'x-storage-token': token },
    },
  });

  if (response.status !== 200) throw new Error(`File download failed: ${response.status}`);

  const blob = response.data;

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
}

export const useDownloadFile = () => {
  return useMutation<void, Error, DownloadFileVars>({
    mutationFn: downloadFileRequest,
    onSuccess: () => toast('Файл успешно загружен'),
    onError: (err) => handleError(err, 'files'),
  });
};
