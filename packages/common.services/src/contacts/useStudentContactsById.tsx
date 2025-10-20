import { contactsApiConfig, ContactsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useStudentContactsById = (studentId: string | number, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: contactsApiConfig[ContactsQueryKey.GetStudentContactById].method,
      getUrl: () => contactsApiConfig[ContactsQueryKey.GetStudentContactById].getUrl(studentId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [ContactsQueryKey.GetStudentContactById, studentId],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
