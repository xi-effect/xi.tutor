import { useCallback, useState } from 'react';
import { useCreateVkConnection } from './useCreateVkConnection';
import { useGetDeliveryMethods } from './useGetDeliveryMethods';

export function useVkConnection() {
  const [connectionData, setConnectionData] = useState<{
    key: string;
    community_id: number;
  } | null>(null);

  const { data, refetch } = useGetDeliveryMethods();
  const { mutate: createConnection, isPending } = useCreateVkConnection();

  const isConnected = data?.vk !== null;

  const handleConnect = useCallback(() => {
    if (isConnected || isPending) return;

    createConnection(undefined, {
      onSuccess: (response) => {
        setConnectionData(response);
      },
    });
  }, [createConnection, isConnected, isPending]);

  const handleCheckConnection = useCallback(async () => {
    const result = await refetch();
    if (result.data?.vk) {
      setConnectionData(null);
    }
  }, [refetch]);

  const resetConnection = useCallback(() => {
    setConnectionData(null);
  }, []);

  return {
    isConnected,
    isPending,
    connectionData,
    handleConnect,
    handleCheckConnection,
    resetConnection,
  };
}
