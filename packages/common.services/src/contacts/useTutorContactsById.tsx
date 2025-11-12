import { contactsApiConfig, ContactsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useTutorContactsById = (tutorId: string | number, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: contactsApiConfig[ContactsQueryKey.GetTutorContactById].method,
      getUrl: () => contactsApiConfig[ContactsQueryKey.GetTutorContactById].getUrl(tutorId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [ContactsQueryKey.GetTutorContactById, tutorId],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
