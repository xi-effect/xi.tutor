import { useSocket } from 'common.sockets';
import { useNotificationsContext } from 'common.services';

export const NotificationDebug = () => {
  const { socket, isConnected } = useSocket();
  const { notifications, unreadCount } = useNotificationsContext();

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs rounded-lg bg-black/80 p-4 text-xs text-white">
      <h3 className="mb-2 font-bold">🔧 Отладка уведомлений</h3>
      <div className="space-y-1">
        <div>Socket ID: {socket?.id || 'Нет'}</div>
        <div>Подключен: {isConnected ? '✅' : '❌'}</div>
        <div>Уведомлений: {notifications.length}</div>
        <div>Непрочитанных: {unreadCount}</div>
      </div>
    </div>
  );
};
