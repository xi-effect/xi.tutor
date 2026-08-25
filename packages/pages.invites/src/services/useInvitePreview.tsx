import { studentApiConfig, StudentQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useInvitePreview = (code: string, options?: { disabled?: boolean }) => {
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
    disabled: options?.disabled,
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
