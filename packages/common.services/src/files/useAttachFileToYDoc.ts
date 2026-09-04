import { filesApiConfig, FilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';
import { handleError } from '../utils';

export type AttachFileToYDocVars = {
  ydocId: string;
  fileId: string;
  token: string;
};

export async function attachFileToYDocRequest({
  ydocId,
  fileId,
  token,
}: AttachFileToYDocVars): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = filesApiConfig[FilesQueryKey.AttachFileToYDoc];

  const response = await axiosInst({
    method,
    url: getUrl(ydocId, fileId),
    headers: {
      'Content-Type': 'application/json',
      'x-content-token': token,
    },
  });

  if (response.status !== 204) {
    throw new Error(`Attach file to YDoc failed: ${response.status}`);
  }
}

export const useAttachFileToYDoc = () => {
  return useMutation<void, Error, AttachFileToYDocVars>({
    mutationFn: attachFileToYDocRequest,
    onError: (err) => handleError(err, 'files'),
  });
};
