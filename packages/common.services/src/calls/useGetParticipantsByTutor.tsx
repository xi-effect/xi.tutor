import { callsApiConfig, CallsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export interface Participant {
  user_id: number;
  display_name: string;
}

export const useGetParticipantsByTutor = (classroom_id: string, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: callsApiConfig[CallsQueryKey.GetParticipantsTutor].method,
      getUrl: () => callsApiConfig[CallsQueryKey.GetParticipantsTutor].getUrl(classroom_id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !classroom_id,
    queryKey: [CallsQueryKey.GetParticipantsTutor, classroom_id],
  });

  return {
    participants: data as Participant[] | undefined,
    isError,
    isLoading,
    ...rest,
  };
};
