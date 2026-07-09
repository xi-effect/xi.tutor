import { getAxiosInstance } from 'common.config';
import { useMutation } from '@tanstack/react-query';
import { notificationsApiConfig } from 'common.api';
import { VKConnectionStartResponse } from 'common.types';

export const useCreateVkConnection = () => {
  return useMutation({
    mutationFn: async () => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: notificationsApiConfig.CreateVkConnection.method,
        url: notificationsApiConfig.CreateVkConnection.getUrl(),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data as VKConnectionStartResponse;
    },
    onError: (error) => {
      console.error('Ошибка при подключении VK:', error);
    },
  });
};
