import { useDeleteDeliveryMethod } from 'common.services';

export const useDisconnectVk = () => {
  const { mutate } = useDeleteDeliveryMethod();

  const handleDisconnectVk = () => {
    mutate('vk');
  };

  return { handleDisconnectVk };
};
