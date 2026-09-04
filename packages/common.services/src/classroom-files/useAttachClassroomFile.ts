import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomFilesApiConfig, ClassroomFilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { AxiosError } from 'axios';
import { handleError } from '../utils';
import { invalidateClassroomFiles } from './useUploadClassroomFile';

export type AttachClassroomFileVars = {
  classroomId: string;
  fileId: string;
};

export async function attachClassroomFileRequest({
  classroomId,
  fileId,
}: AttachClassroomFileVars): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = classroomFilesApiConfig[ClassroomFilesQueryKey.AttachClassroomFile];

  await axiosInst({
    method,
    url: getUrl(classroomId, fileId),
  });
}

export const useAttachClassroomFile = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AttachClassroomFileVars>({
    mutationFn: attachClassroomFileRequest,
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 409) {
        return;
      }
      handleError(err, 'files');
    },
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomFiles(queryClient, classroomId);
    },
  });
};
