import {
  useCreateTgConnection,
  useDeleteTgConnection,
  useGetNotificationsStatus,
} from 'common.services';

export const useConnectTg = () => {
  const { mutate: createConnection, isPending } = useCreateTgConnection();
  const { mutate: deleteConnection } = useDeleteTgConnection();
  const { data } = useGetNotificationsStatus();

  const status = data?.telegram?.connection?.status;

  const handleConnectTg = () => {
    if (status === 'active') return;

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
      deleteConnection(undefined, {
        onSuccess: connect,
      });
    } else {
      connect();
    }
  };

  return { handleConnectTg, isPending };
};
