# Система уведомлений

Система уведомлений для приложения с интеграцией SocketIO.

## Возможности

- ✅ Получение уведомлений через SocketIO в реальном времени
- ✅ Отображение счетчика непрочитанных уведомлений
- ✅ Toast уведомления при получении новых сообщений
- ✅ Отметка уведомлений как прочитанных
- ✅ Удаление уведомлений
- ✅ Тестовая кнопка для отправки тестовых уведомлений

## Архитектура

### Типы уведомлений

```typescript
type NotificationType =
  | 'message' // Новое сообщение
  | 'lesson_reminder' // Напоминание о занятии
  | 'new_material' // Новый материал
  | 'payment_success' // Успешная оплата
  | 'group_invitation' // Приглашение в группу
  | 'system_update' // Обновление системы
  | 'birthday' // День рождения
  | 'general'; // Общее уведомление
```

### Структура уведомления

```typescript
type NotificationT = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  userId?: string;
  metadata?: Record<string, any>;
};
```

### SocketIO события

- `notification:new` - новое уведомление
- `notification:read` - отметить как прочитанное
- `notification:read_all` - отметить все как прочитанные
- `notification:delete` - удалить уведомление
- `notification:test` - тестовое уведомление

## Использование

### Основной компонент

```tsx
import { Notifications } from 'modules.navigation';

// В компоненте
<Notifications />;
```

### Хук для работы с уведомлениями

```tsx
import { useNotifications } from 'common.services';

const MyComponent = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
  } = useNotifications();

  // Использование...
};
```

### Тестовая кнопка

```tsx
import { TestNotificationButton } from 'modules.navigation';

// В компоненте
<TestNotificationButton />;
```

## Интеграция с бэкендом

### Ожидаемые события от сервера

1. **Новое уведомление**:

```javascript
socket.emit('notification:new', {
  id: 'unique-id',
  type: 'message',
  title: 'Новое сообщение',
  description: 'Описание уведомления',
  date: '2024-01-01T12:00:00Z',
  isRead: false,
});
```

2. **Подтверждение прочтения**:

```javascript
// Клиент отправляет
socket.emit('notification:read', { id: 'notification-id' });

// Сервер может подтвердить
socket.emit('notification:read_confirmed', { id: 'notification-id' });
```

### Отправка событий на сервер

Клиент автоматически отправляет следующие события:

- `notification:read` - при клике на непрочитанное уведомление
- `notification:read_all` - при нажатии "Прочитать все"
- `notification:delete` - при удалении уведомления
- `notification:test` - при нажатии тестовой кнопки

## Стилизация

### Непрочитанные уведомления

Непрочитанные уведомления выделяются синим фоном (`bg-blue-5`).

### Счетчик уведомлений

Счетчик отображается в правом верхнем углу иконки колокольчика:

- Красный фон (`bg-red-100`)
- Белый текст
- Максимум "99+" для больших чисел

### Toast уведомления

Используется библиотека `sonner` для отображения toast уведомлений:

- Заголовок: название уведомления
- Описание: текст уведомления
- Длительность: 5 секунд

## Настройка

### Изменение типов уведомлений

Добавьте новые типы в `packages/common.types/src/notifications.ts`:

```typescript
export type NotificationType =
  | 'message'
  | 'lesson_reminder'
  | 'new_material'
  | 'payment_success'
  | 'group_invitation'
  | 'system_update'
  | 'birthday'
  | 'general'
  | 'your_new_type'; // Добавьте новый тип
```

### Кастомизация toast уведомлений

В `packages/common.services/src/notifications/useNotifications.ts`:

```typescript
// Показываем toast уведомление
toast(notification.title, {
  description: notification.description,
  duration: 5000, // Измените длительность
  // Добавьте другие опции sonner
});
```

## Разработка

### Добавление новых функций

1. Обновите типы в `common.types`
2. Добавьте логику в `useNotifications`
3. Обновите UI компоненты
4. Добавьте тесты

### Отладка

1. Откройте DevTools
2. Проверьте консоль на ошибки SocketIO
3. Используйте тестовую кнопку для проверки функциональности
4. Проверьте состояние в React DevTools
