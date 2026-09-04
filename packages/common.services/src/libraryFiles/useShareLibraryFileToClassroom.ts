import { classroomFilesApiConfig, ClassroomFilesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { handleError } from '../utils';
import { invalidateClassroomFiles } from '../classroom-files/useUploadClassroomFile';
import { appendLibraryFileClassroomId } from './useGetLibraryFileClassroomIds';

export type ShareLibraryFileToClassroomVars = {
  fileId: string;
  classroomId: number;
  name: string;
};

export async function shareLibraryFileToClassroomRequest({
  fileId,
  classroomId,
}: ShareLibraryFileToClassroomVars): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = classroomFilesApiConfig[ClassroomFilesQueryKey.AttachClassroomFile];

  await axiosInst({
    method,
    url: getUrl(String(classroomId), fileId),
  });
}

export const useShareLibraryFileToClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ShareLibraryFileToClassroomVars>({
    mutationFn: shareLibraryFileToClassroomRequest,
    onError: (err, variables) => {
      if (err instanceof AxiosError && err.response?.status === 409) {
        appendLibraryFileClassroomId(queryClient, variables.fileId, variables.classroomId);
        return;
      }

      handleError(err, 'files');
    },
    onSuccess: (_data, variables) => {
      appendLibraryFileClassroomId(queryClient, variables.fileId, variables.classroomId);
      invalidateClassroomFiles(queryClient, String(variables.classroomId));
    },
  });
};
