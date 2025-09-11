import { studentApiConfig, StudentQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useInvitePreview = (code: string) => {
  const { method, getUrl } = studentApiConfig[StudentQueryKey.InvitationPreview];

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method,
      getUrl: () => getUrl(code),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [StudentQueryKey.InvitationPreview, code],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
