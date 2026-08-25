import { getAxiosInstance } from 'common.config';
import { filesApiConfig, FilesQueryKey } from 'common.api';
import { saveBlob } from 'common.platform';
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

  const blob = response.data as Blob;
  await saveBlob(blob, { fileName });
}

export const useDownloadFile = () => {
  return useMutation<void, Error, DownloadFileVars>({
    mutationFn: downloadFileRequest,
    onSuccess: () => toast('Файл успешно загружен'),
    onError: (err) => handleError(err, 'files'),
  });
};
