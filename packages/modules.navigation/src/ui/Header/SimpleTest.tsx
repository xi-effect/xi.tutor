import { useState } from 'react';
import { Button } from '@xipkg/button';
import { useNotificationsContext } from 'common.services';

export const SimpleTest = () => {
  const [localCount, setLocalCount] = useState(0);
  const { notifications, unreadCount, sendTestNotification } = useNotificationsContext();

  const handleLocalClick = () => {
    setLocalCount((prev) => prev + 1);
    console.log('🔢 Локальный счетчик увеличен:', localCount + 1);
  };

  const handleNotificationClick = () => {
    console.log('🔔 Вызов sendTestNotification');
    sendTestNotification();
  };

  return (
    <div className="fixed top-4 left-4 z-50 rounded-lg bg-blue-500 p-4 text-xs text-white">
      <h3 className="mb-2 font-bold">🧪 Простой тест</h3>
      <div className="space-y-2">
        <div>Локальный счетчик: {localCount}</div>
        <div>Уведомлений: {notifications.length}</div>
        <div>Непрочитанных: {unreadCount}</div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleLocalClick}>
            +1
          </Button>
          <Button size="sm" onClick={handleNotificationClick}>
            Тест уведомления
          </Button>
        </div>
      </div>
    </div>
  );
};
