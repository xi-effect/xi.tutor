import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { NotificationsQueryKey, notificationsApiConfig } from 'common.api';
import { VKConnectionStartResponse } from 'common.types';

type VKConnectionStartResponseRaw = {
  group_id?: number;
  /** @deprecated бэк может ещё отдавать community_id в старых ответах */
  community_id?: number;
  key: string;
};

function normalizeVkConnectionStartResponse(
  data: VKConnectionStartResponseRaw,
): VKConnectionStartResponse {
  const groupId = data.group_id ?? data.community_id;

  if (groupId == null || !data.key) {
    throw new Error('Некорректный ответ при подключении VK: нет group_id или key');
  }

  return {
    group_id: groupId,
    key: data.key,
  };
}

export const useCreateVkConnection = () => {
  const queryClient = useQueryClient();

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

      return normalizeVkConnectionStartResponse(response.data as VKConnectionStartResponseRaw);
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: [NotificationsQueryKey.DeliveryMethods] });
        toast.error('ВКонтакте уже подключён');
        return;
      }

      console.error('Ошибка при подключении VK:', error);
    },
  });
};
