import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { handleError } from '../utils';

export type ShareLibraryFileToClassroomVars = {
  fileId: string;
  classroomId: number;
  name: string;
};

export async function shareLibraryFileToClassroomRequest({
  fileId,
  classroomId,
  name,
}: ShareLibraryFileToClassroomVars): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } =
    classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.AddClassroomMaterials];

  await axiosInst({
    method,
    url: getUrl(String(classroomId)),
    data: {
      content_kind: 'file',
      file_id: fileId,
      name,
      student_access_mode: 'read_only',
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const useShareLibraryFileToClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ShareLibraryFileToClassroomVars>({
    mutationFn: shareLibraryFileToClassroomRequest,
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 409) {
        return;
      }

      handleError(err, 'files');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials, String(variables.classroomId)],
      });
    },
  });
};
