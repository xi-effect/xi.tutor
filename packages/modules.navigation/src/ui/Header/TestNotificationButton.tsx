import { Button } from '@xipkg/button';
import { Notification } from '@xipkg/icons';
import { useNotificationsContext } from 'common.services';

export const TestNotificationButton = () => {
  const { sendTestNotification } = useNotificationsContext();

  const handleClick = () => {
    console.log('🔘 Нажата тестовая кнопка уведомлений');
    sendTestNotification();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="fixed right-4 bottom-4 z-50"
    >
      <Notification className="mr-2 h-4 w-4" />
      Тест уведомления
    </Button>
  );
};
