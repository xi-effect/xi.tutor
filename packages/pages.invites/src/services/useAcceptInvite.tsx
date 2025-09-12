import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassroomResponseT } from '../types';
import { useNavigate } from '@tanstack/react-router';
import { ClassroomsQueryKey, studentApiConfig, StudentQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from 'common.services';

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<ClassroomResponseT, Error, string>({
    mutationFn: async (code: string) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: studentApiConfig[StudentQueryKey.UseInvitation].method,
          url: studentApiConfig[StudentQueryKey.UseInvitation].getUrl(code),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data as ClassroomResponseT;
      } catch (err) {
        console.error('Ошибка:', err);
        throw err;
      }
    },
    onSuccess: (classroomData) => {
      queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
      navigate({ to: `/classrooms/${classroomData.id}` });
    },
    onError: (error) => {
      console.error('Ошибка:', error.message);
      handleError(error, 'acceptInvite');
    },
  });
};
