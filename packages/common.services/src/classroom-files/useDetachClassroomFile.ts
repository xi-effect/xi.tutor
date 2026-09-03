import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomFilesApiConfig, ClassroomFilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '../utils';
import { invalidateClassroomFiles } from './useUploadClassroomFile';

export type DetachClassroomFileVars = {
  classroomId: string;
  fileId: string;
};

export async function detachClassroomFileRequest({
  classroomId,
  fileId,
}: DetachClassroomFileVars): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = classroomFilesApiConfig[ClassroomFilesQueryKey.DetachClassroomFile];

  await axiosInst({
    method,
    url: getUrl(classroomId, fileId),
  });
}

export const useDetachClassroomFile = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DetachClassroomFileVars>({
    mutationFn: detachClassroomFileRequest,
    onError: (err) => {
      handleError(err, 'files');
    },
    onSuccess: (_data, { classroomId }) => {
      invalidateClassroomFiles(queryClient, classroomId);
    },
  });
};
