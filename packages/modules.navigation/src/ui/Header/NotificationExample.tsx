import { Button } from '@xipkg/button';
import { useNotificationsContext } from 'common.services';

/**
 * Компонент для демонстрации различных типов уведомлений
 * Используется для тестирования системы уведомлений
 */
export const NotificationExample = () => {
  const { sendTestNotification } = useNotificationsContext();

  const examples = [
    'Материал в классе',
    'Занятие запланировано',
    'Оплата успешна',
    'Приглашение в группу',
    'Системное обновление',
    'День рождения',
  ];

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-xs rounded-lg bg-black/80 p-4 text-xs text-white">
      <h3 className="mb-2 font-bold">🧪 Примеры уведомлений</h3>
      <div className="space-y-2">
        {examples.map((title, index) => (
          <Button
            key={index}
            size="sm"
            variant="outline"
            className="w-full text-left"
            onClick={sendTestNotification}
          >
            {title}
          </Button>
        ))}
        <Button size="sm" variant="outline" className="w-full" onClick={sendTestNotification}>
          Общее уведомление
        </Button>
      </div>
    </div>
  );
};
