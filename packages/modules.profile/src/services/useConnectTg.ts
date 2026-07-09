import {
  useCreateTgConnection,
  useDeleteDeliveryMethod,
  useGetNotificationsStatus,
} from 'common.services';

export const useConnectTg = () => {
  const { mutate: createConnection, isPending } = useCreateTgConnection();
  const { mutate: deleteConnection } = useDeleteDeliveryMethod();
  const { data } = useGetNotificationsStatus();

  const status = data?.telegram?.delivery_method.status;

  const handleConnectTg = () => {
    if (status === 'active' || isPending) return;

    const telegramLinkTab = window.open('', '_blank');

    const connect = () => {
      createConnection(undefined, {
        onSuccess: (link: string) => {
          if (telegramLinkTab) telegramLinkTab.location.href = link;
        },
        onError: () => {
          telegramLinkTab?.close();
        },
      });
    };

    if (status === 'blocked' || status === 'replaced') {
      deleteConnection('telegram', {
        onSuccess: connect,
      });
    } else {
      connect();
    }
  };

  return { handleConnectTg, isPending };
};
