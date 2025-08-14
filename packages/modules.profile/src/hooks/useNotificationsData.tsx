import { useCurrentUser, useGetNotificationsStatus } from 'common.services';
import { useConnectTg, useDisconnectTg } from '../services';

export function useNotificationsData() {
  const { data: user } = useCurrentUser();
  const { data } = useGetNotificationsStatus();

  const { handleConnectTg } = useConnectTg();
  const { handleDisconnectTg } = useDisconnectTg();

  const isTgConnectionActive = data?.telegram?.connection.status === 'active';
  const isTgConnectionBlocked = data?.telegram?.connection.status === 'blocked';
  const isTgConnectionReplaced = data?.telegram?.connection.status === 'replaced';

  const tgConnectionStatus = [
    {
      condition: !data?.telegram,
      text: 'Не подключен',
      color: 'text-gray-80',
    },
    {
      condition: isTgConnectionActive,
      text: data?.telegram?.contact?.title || user?.username,
      color: 'text-gray-80',
    },
    {
      condition: isTgConnectionBlocked,
      text: 'Разблокируйте бота в Telegram или удалите привязку и подключите заново',
      color: 'text-red-80',
    },
    {
      condition: isTgConnectionReplaced,
      text: 'Удалите текущую привязку и подключите заново',
      color: 'text-orange-60',
    },
  ];

  return {
    user,
    data,
    isTgConnectionActive,
    isTgConnectionBlocked,
    isTgConnectionReplaced,
    tgConnectionStatus,
    handleConnectTg,
    handleDisconnectTg,
  };
}
