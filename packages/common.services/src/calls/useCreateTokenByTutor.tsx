import { callsApiConfig, CallsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';

export interface CreateAccessTokenData {
  classroom_id: string;
}

export interface AccessTokenResponse {
  url: string;
}

export const useCreateTokenByTutor = () => {
  const createTokenByTutorMutation = useMutation({
    mutationFn: async (data: CreateAccessTokenData) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: callsApiConfig[CallsQueryKey.CreateAccessTokenTutor].method,
          url: callsApiConfig[CallsQueryKey.CreateAccessTokenTutor].getUrl(data.classroom_id),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data as AccessTokenResponse;
      } catch (err) {
        console.error('Ошибка при создании access token:', err);
        throw err;
      }
    },
    onError: () => {},
    onSuccess: () => {},
  });

  return { createTokenByTutor: createTokenByTutorMutation };
};
