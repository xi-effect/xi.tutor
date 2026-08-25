import { callsApiConfig, CallsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export interface Participant {
  user_id: number;
  display_name: string;
}

type ConferenceParticipantsData = {
  participants?: Participant[];
  conferenceNotActive: boolean;
};

export const useGetParticipantsByStudent = (classroom_id: string, disabled?: boolean) => {
  const { data, isError, isLoading, error, ...rest } = useQuery({
    queryKey: [CallsQueryKey.GetParticipantsStudent, classroom_id],
    enabled: !disabled && !!classroom_id,
    queryFn: async (): Promise<ConferenceParticipantsData> => {
      const axiosInst = await getAxiosInstance();
      try {
        const response = await axiosInst({
          method: callsApiConfig[CallsQueryKey.GetParticipantsStudent].method,
          url: callsApiConfig[CallsQueryKey.GetParticipantsStudent].getUrl(classroom_id),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return { participants: response.data as Participant[], conferenceNotActive: false };
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 409) {
          return { participants: undefined, conferenceNotActive: true };
        }
        throw err;
      }
    },
  });

  const is409 = isError && error instanceof AxiosError && error.response?.status === 409;

  return {
    participants: data?.participants,
    isConferenceNotActive: data?.conferenceNotActive === true || is409,
    isError: isError && !is409,
    isLoading,
    error,
    ...rest,
  };
};
