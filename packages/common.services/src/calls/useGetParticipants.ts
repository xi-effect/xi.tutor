import { callsApiConfig, CallsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { AxiosError } from 'axios';
export interface Participant {
  user_id: number;
  display_name: string;
}

type RoleT = 'student' | 'tutor';

export const useGetParticipants = (classroom_id: string, role: RoleT) => {
  const { data, isError, isLoading, error, ...rest } = useFetching({
    apiConfig: {
      method: callsApiConfig[CallsQueryKey.GetParticipants].method,
      getUrl: () => callsApiConfig[CallsQueryKey.GetParticipants].getUrl(classroom_id, role),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: !classroom_id,
    queryKey: [CallsQueryKey.GetParticipants, classroom_id, role],
  });

  const isConferenceNotActive =
    isError && error instanceof AxiosError && error.response?.status === 409;

  return {
    participants: data as Participant[] | undefined,
    isConferenceNotActive,
    isError,
    isLoading,
    ...rest,
  };
};
