import { enrollmentsApiConfig, EnrollmentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { TutorStudentSchemaMarshal } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';

export const useAddStudentFromGroup = ({ classroom_id }: { classroom_id: string }) => {
  const queryClient = useQueryClient();

  const addStudentFromGroupMutation = useMutation({
    mutationFn: async (student_id: number) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: enrollmentsApiConfig[EnrollmentsQueryKey.AddStudentToClassroom].method,
          url: enrollmentsApiConfig[EnrollmentsQueryKey.AddStudentToClassroom].getUrl(
            classroom_id,
            student_id.toString(),
          ),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (err) {
        console.error('Ошибка:', err);
        throw err;
      }
    },
    onMutate: async (student_id) => {
      await queryClient.cancelQueries({ queryKey: [EnrollmentsQueryKey.GetAllStudents] });

      const previousStudents = queryClient.getQueryData<TutorStudentSchemaMarshal[]>([
        EnrollmentsQueryKey.GetAllStudents,
      ]);

      queryClient.setQueryData<TutorStudentSchemaMarshal[]>(
        [EnrollmentsQueryKey.GetAllStudents],
        (old: TutorStudentSchemaMarshal[] | undefined) => {
          if (!old) return old;
          return old.filter(
            (student: TutorStudentSchemaMarshal) => student.tutorship.student_id !== student_id,
          );
        },
      );

      return { previousStudents };
    },
    onError: (err, _student_id, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData<TutorStudentSchemaMarshal[]>(
          [EnrollmentsQueryKey.GetAllStudents],
          context.previousStudents,
        );
      }

      handleError(err, 'deleteStudent');
    },
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData<TutorStudentSchemaMarshal[]>(
          [EnrollmentsQueryKey.GetAllStudents],
          response.data,
        );
      }
      queryClient.invalidateQueries({
        queryKey: [EnrollmentsQueryKey.GetAllStudents],
      });
    },
  });

  return { ...addStudentFromGroupMutation };
};
