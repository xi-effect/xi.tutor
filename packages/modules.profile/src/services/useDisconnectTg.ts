import { useDeleteDeliveryMethod } from 'common.services';

export const useDisconnectTg = () => {
  const { mutate } = useDeleteDeliveryMethod();

  const handleDisconnectTg = () => {
    mutate('telegram');
  };

  return { handleDisconnectTg };
};
