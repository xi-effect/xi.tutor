import { StudentQueryKey, ClassroomTutorResponseSchema } from 'common.api';
import { useQuery } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';
import { env } from 'common.env';

export const useGetClassroomStudent = (classroomId: number, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useQuery({
    queryKey: [StudentQueryKey.GetClassroom, classroomId],
    queryFn: async () => {
      const axiosInst = await getAxiosInstance();
      const url = `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/student/classrooms/${classroomId}/`;

      const response = await axiosInst({
        method: 'GET',
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data as ClassroomTutorResponseSchema;
    },
    enabled: !disabled && !!classroomId,
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
