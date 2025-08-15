import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsQueryKey, notificationsApiConfig } from 'common.api';

export const useChangeContactsVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newValue: boolean) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: notificationsApiConfig[NotificationsQueryKey.ContactsVisibility].method,
          url: notificationsApiConfig[NotificationsQueryKey.ContactsVisibility].getUrl(),
          data: {
            is_public: newValue,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при обновлении :', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NotificationsQueryKey.NotificationsSettings],
      });
    },
  });
};
