import { useDeleteTgConnection } from 'common.services';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationsQueryKey } from 'common.api';

export const useDisconnectTg = () => {
  const { mutate } = useDeleteTgConnection();
  const queryClient = useQueryClient();

  const handleDisconnectTg = () => {
    mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [NotificationsQueryKey.NotificationsSettings] });
      },
    });
  };

  return { handleDisconnectTg };
};
