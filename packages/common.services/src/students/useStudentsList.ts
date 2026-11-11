import { studentsApiConfig, StudentsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import type { TutorStudentSchemaMarshal } from 'common.types';
import { useQuery } from '@tanstack/react-query';
import { collectTutorStudentPages, STUDENTS_LIST_PAGE_LIMIT } from './studentProfileLookup';

const fetchAllTutorStudents = async (signal?: AbortSignal) => {
  const axiosInstance = await getAxiosInstance();
  const { method, getUrl } = studentsApiConfig[StudentsQueryKey.AllStudents];

  return collectTutorStudentPages(async (cursor) => {
    const response = await axiosInstance.request<TutorStudentSchemaMarshal[]>({
      method,
      url: getUrl(),
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        limit: STUDENTS_LIST_PAGE_LIMIT,
        ...(cursor ? { created_before: cursor } : {}),
      },
    });

    return response.data;
  });
};

export const useStudentsList = (options?: { disabled?: boolean }) => {
  return useQuery({
    queryKey: [StudentsQueryKey.AllStudents],
    enabled: !options?.disabled,
    queryFn: ({ signal }) => fetchAllTutorStudents(signal),
  });
};
