# Система обработки сетевых ошибок

Эта система предоставляет автоматическую обработку сетевых ошибок и потери интернет-соединения с возможностью повтора запросов при восстановлении соединения.

## Компоненты

### NetworkProvider

Основной провайдер, который должен обернуть приложение для активации системы.

```tsx
import { NetworkProvider } from 'common.services';

export const App = () => {
  return <NetworkProvider>{/* Ваше приложение */}</NetworkProvider>;
};
```

### NetworkIndicator

Визуальный индикатор состояния сети, который показывает:

- ✅ Подключено (зеленый)
- ⚠️ Проверка соединения (желтый)
- ❌ Нет соединения (красный)

```tsx
import { NetworkIndicator } from 'common.ui';

// Показывать только иконку
<NetworkIndicator />

// Показывать иконку и текст
<NetworkIndicator showText />
```

### useNetworkStatus

Хук для получения текущего состояния сети:

```tsx
import { useNetworkStatus } from 'common.utils';

const MyComponent = () => {
  const { isOnline, isReconnecting, lastOnlineTime, lastOfflineTime } = useNetworkStatus();

  return (
    <div>
      Статус: {isOnline ? 'Онлайн' : 'Офлайн'}
      {isReconnecting && <span>Проверка соединения...</span>}
    </div>
  );
};
```

### useNetworkRetry

Хук для ручного добавления запросов в очередь повторов:

```tsx
import { useNetworkRetry } from 'common.services';

const MyComponent = () => {
  const { retryOnReconnect } = useNetworkRetry();

  const handleSubmit = async () => {
    try {
      await retryOnReconnect(
        async () => {
          // Ваш запрос
          return await api.post('/data', formData);
        },
        3, // Максимальное количество попыток
        'Сохранение данных', // Описание для пользователя
      );
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };
};
```

### useNetworkRetryWithToast

Улучшенная версия хука с уведомлениями:

```tsx
import { useNetworkRetryWithToast } from 'common.services';

const MyComponent = () => {
  const { retryWithNotification } = useNetworkRetryWithToast();

  const handleSubmit = async () => {
    try {
      await retryWithNotification(
        async () => {
          return await api.post('/data', formData);
        },
        3,
        'Сохранение данных',
      );
    } catch (error) {
      // Обработка ошибок
    }
  };
};
```

## Автоматическая обработка

Система автоматически:

1. Отслеживает состояние интернет-соединения
2. Показывает уведомления при потере/восстановлении соединения
3. Добавляет неудачные запросы в очередь повторов
4. Автоматически повторяет запросы при восстановлении соединения
5. Показывает прогресс обработки очереди

## Настройка

### Таймауты по умолчанию

- Проверка соединения: каждые 30 секунд
- Таймаут ping: 5 секунд
- Задержка перед обработкой очереди: 1 секунда

### Максимальные попытки

По умолчанию: 3 попытки для каждого запроса

## Примеры использования

### В компоненте формы

```tsx
const FormComponent = () => {
  const { retryWithNotification } = useNetworkRetryWithToast();

  const handleSubmit = async (data: FormData) => {
    try {
      await retryWithNotification(() => api.submitForm(data), 3, 'Отправка формы');
      toast.success('Форма отправлена');
    } catch (error) {
      if (error.message === 'Запрос добавлен в очередь повторов') {
        // Запрос будет повторен автоматически
        return;
      }
      toast.error('Ошибка отправки формы');
    }
  };
};
```

### В хуке для API

```tsx
export const useSubmitData = () => {
  const { retryOnReconnect } = useNetworkRetry();

  return useMutation({
    mutationFn: async (data: Data) => {
      return retryOnReconnect(() => api.post('/data', data), 3, 'Сохранение данных');
    },
  });
};
```

## Мониторинг

Система логирует все важные события в консоль:

- Добавление запросов в очередь
- Обработка очереди при восстановлении соединения
- Успешные/неудачные повторы
- Ошибки сети

## Совместимость

Система работает с:

- Axios (автоматически через интерцепторы)
- Fetch API (через ручные хуки)
- Любыми другими HTTP-клиентами (через ручные хуки)
