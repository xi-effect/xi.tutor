import { useCreateTgConnection, useGetNotificationsStatus } from 'common.services';

export const useConnectTg = () => {
  const { mutate, isPending } = useCreateTgConnection();
  const { data } = useGetNotificationsStatus();

  const handleConnectTg = () => {
    if (data.telegram) {
      return;
    }

    mutate(undefined, {
      onSuccess: (data: string) => {
        if (data) {
          window.open(data, '_blank');
        }
      },
    });
  };

  return {
    handleConnectTg,
    isPending,
  };
};
