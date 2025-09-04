import { studentsApiConfig, StudentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { TutorStudentSchemaMarshal } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  const deleteStudentMutation = useMutation({
    mutationFn: async (student_id: number) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: studentsApiConfig[StudentsQueryKey.DeleteStudent].method,
          url: studentsApiConfig[StudentsQueryKey.DeleteStudent].getUrl(student_id),
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
      await queryClient.cancelQueries({ queryKey: [StudentsQueryKey.AllStudents] });

      const previousStudents = queryClient.getQueryData<TutorStudentSchemaMarshal[]>([
        StudentsQueryKey.AllStudents,
      ]);

      queryClient.setQueryData<TutorStudentSchemaMarshal[]>(
        [StudentsQueryKey.AllStudents],
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
          [StudentsQueryKey.AllStudents],
          context.previousStudents,
        );
      }

      handleError(err, 'deleteStudent');
    },
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData<TutorStudentSchemaMarshal[]>(
          [StudentsQueryKey.AllStudents],
          response.data,
        );
      }
    },
  });

  return { ...deleteStudentMutation };
};
