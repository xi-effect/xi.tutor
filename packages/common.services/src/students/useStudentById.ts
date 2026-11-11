import { studentsApiConfig, StudentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import type { TutorStudentSchemaMarshal } from 'common.types';
import { findStudentProfile, shouldRequestStudentById } from './studentProfileLookup';
import { useStudentsList } from './useStudentsList';

export const useStudentById = (id: number, disabled?: boolean) => {
  const skip = Boolean(disabled) || !id || id === 0;

  const studentsQuery = useStudentsList({ disabled: skip });
  const students = studentsQuery.data as TutorStudentSchemaMarshal[] | undefined;
  const profileFromList = findStudentProfile(students, id);
  const listSettled = studentsQuery.isFetched || studentsQuery.isError;
  const waitingForList = !skip && !listSettled;

  const detail = useFetching({
    apiConfig: {
      method: studentsApiConfig[StudentsQueryKey.StudentById].method,
      getUrl: () => studentsApiConfig[StudentsQueryKey.StudentById].getUrl(id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: !shouldRequestStudentById({
      skip,
      listSettled,
      hasProfile: Boolean(profileFromList),
    }),
    queryKey: [StudentsQueryKey.StudentById, id],
  });

  return {
    ...detail,
    data: profileFromList ?? (waitingForList ? undefined : detail.data),
    isLoading: waitingForList || (!profileFromList && detail.isLoading),
    isFetching: waitingForList || (!profileFromList && detail.isFetching),
    isPending: waitingForList || (!profileFromList && detail.isPending),
    isError: !profileFromList && !waitingForList && detail.isError,
    isSuccess: Boolean(profileFromList) || (!waitingForList && detail.isSuccess),
  };
};
