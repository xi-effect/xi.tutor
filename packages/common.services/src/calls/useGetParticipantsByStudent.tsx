import { callsApiConfig, CallsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { AxiosError } from 'axios';

export interface Participant {
  user_id: number;
  display_name: string;
}

export const useGetParticipantsByStudent = (classroom_id: string, disabled?: boolean) => {
  const { data, isError, isLoading, error, ...rest } = useFetching({
    apiConfig: {
      method: callsApiConfig[CallsQueryKey.GetParticipantsStudent].method,
      getUrl: () => callsApiConfig[CallsQueryKey.GetParticipantsStudent].getUrl(classroom_id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !classroom_id,
    queryKey: [CallsQueryKey.GetParticipantsStudent, classroom_id],
  });

  // Проверяем, является ли ошибка 409 (комната не активна)
  const isConferenceNotActive =
    isError && error instanceof AxiosError && error.response?.status === 409;

  return {
    participants: data as Participant[] | undefined,
    isConferenceNotActive, // true если комната не активна (409)
    isError,
    isLoading,
    ...rest,
  };
};
