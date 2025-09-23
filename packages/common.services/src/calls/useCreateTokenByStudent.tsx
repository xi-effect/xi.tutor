import { callsApiConfig, CallsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface CreateAccessTokenData {
  classroom_id: string;
}

export interface AccessTokenResponse {
  url: string;
}

export const useCreateTokenByStudent = () => {
  const createTokenByStudentMutation = useMutation({
    mutationFn: async (data: CreateAccessTokenData) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: callsApiConfig[CallsQueryKey.CreateAccessTokenStudent].method,
          url: callsApiConfig[CallsQueryKey.CreateAccessTokenStudent].getUrl(data.classroom_id),
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
    onError: (err: AxiosError) => {
      // Показываем toast с ошибкой
      console.error('Ошибка при создании access token:', err);

      if (err.status === 409) {
        toast.error('Дождитесь, пока преподаватель начнет звонок', {
          duration: 5000,
        });
      }
    },
    onSuccess: () => {},
  });

  return { createTokenByStudent: createTokenByStudentMutation };
};
