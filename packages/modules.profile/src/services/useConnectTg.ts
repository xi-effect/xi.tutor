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

    const connect = () => {
      createConnection(undefined, {
        onSuccess: (link: string) => {
          if (link) window.open(link, '_blank');
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
