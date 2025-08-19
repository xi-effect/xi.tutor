# Система обработки сетевых ошибок

Эта система предоставляет базовую обработку сетевых ошибок и потери интернет-соединения. Система интеллектуально подавляет уведомления при определенных условиях (выход из приложения, ошибки авторизации).

## Основные возможности

- ✅ Интеллектуальное подавление уведомлений при выходе из приложения
- ✅ Подавление сетевых уведомлений при ошибках авторизации (401, 403)
- ✅ Базовое логирование сетевых ошибок
- ✅ Настраиваемые уведомления
- ✅ Отслеживание состояния сети через браузерные события

## Компоненты

### NetworkProvider

Основной провайдер, который должен обернуть приложение для активации системы.

```tsx
import { NetworkProvider } from 'common.services';

export const App = () => {
  return <NetworkProvider suppressNotifications={false}>{/* Ваше приложение */}</NetworkProvider>;
};
```

**Параметры:**

- `suppressNotifications` (boolean) - глобально отключить все сетевые уведомления

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

### useNetworkControl

Хук для контроля сетевых уведомлений:

```tsx
import { useNetworkControl } from 'common.services';

const MyComponent = () => {
  const {
    suppressNetworkNotifications,
    enableNetworkNotifications,
    setAuthErrorDetected,
    setAppExiting,
    shouldShowNotification,
  } = useNetworkControl({
    suppressNotifications: false,
    suppressOnAuthErrors: true,
    suppressOnAppExit: true,
  });

  // Временно отключить уведомления
  const handleSensitiveOperation = () => {
    suppressNetworkNotifications();
    // выполнить операцию
    setTimeout(enableNetworkNotifications, 5000);
  };
};
```

### useNetworkAuthIntegration

Хук для интеграции с системой авторизации:

```tsx
import { useNetworkAuthIntegration } from 'common.services';

const AuthComponent = () => {
  const { handleAuthError } = useNetworkAuthIntegration();

  const handleLogin = async () => {
    try {
      await loginApi();
    } catch (error) {
      handleAuthError(error); // Автоматически подавит сетевые уведомления
    }
  };
};
```

## Автоматическое подавление уведомлений

Система автоматически подавляет сетевые уведомления в следующих случаях:

1. **Выход из приложения** - при закрытии вкладки, переключении на другую вкладку или закрытии браузера
2. **Ошибки авторизации** - при получении ошибок 401, 403 или специфичных ошибок авторизации
3. **Глобальное отключение** - через параметр `suppressNotifications` в NetworkProvider

## Интеграция с axios

Система автоматически интегрируется с axios через интерцепторы. Сетевые ошибки показываются как toast уведомления, а ошибки авторизации не вызывают сетевых уведомлений.

## Отслеживание состояния сети

Система использует нативные браузерные события `online` и `offline` для отслеживания состояния сети. Это обеспечивает надежное определение потери и восстановления соединения без дополнительных запросов.

## Примеры использования

### Базовое использование

```tsx
import { NetworkProvider } from 'common.services';

function App() {
  return (
    <NetworkProvider>
      <YourApp />
    </NetworkProvider>
  );
}
```

### С отключенными уведомлениями

```tsx
import { NetworkProvider } from 'common.services';

function App() {
  return (
    <NetworkProvider suppressNotifications={true}>
      <YourApp />
    </NetworkProvider>
  );
}
```

### Интеграция с авторизацией

```tsx
import { useNetworkAuthIntegration } from 'common.services';

function LoginForm() {
  const { handleAuthError } = useNetworkAuthIntegration();

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (error) {
      handleAuthError(error);
      // Обработка ошибки авторизации без сетевых уведомлений
    }
  };
}
```

## Интеграция с существующими системами

### Автоматическая интеграция

Система уже интегрирована с:

- `AuthProvider` - автоматически подавляет уведомления при ошибках авторизации
- `useSignin` и `useSignout` - обрабатывают ошибки авторизации
- Axios интерцепторы - фильтруют ошибки авторизации

### Ручная интеграция

Для кастомных компонентов авторизации:

```tsx
import { useNetworkAuthIntegration } from 'common.services';

function CustomAuthForm() {
  const { handleAuthError } = useNetworkAuthIntegration();

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        handleAuthError({ response: { status: response.status, data: error } });
        return;
      }

      // Успешная авторизация
    } catch (error) {
      handleAuthError(error);
    }
  };
}
```

## Настройка поведения

### Отключение индикатора

Индикатор сети больше не отображается по умолчанию. Если нужно показать статус сети, используйте `useNetworkStatus`:

```tsx
import { useNetworkStatus } from 'common.utils';

function NetworkStatus() {
  const { isOnline, isReconnecting } = useNetworkStatus();

  if (isOnline && !isReconnecting) return null;

  return (
    <div className="network-status">
      {!isOnline && <span>Нет соединения</span>}
      {isReconnecting && <span>Проверка соединения...</span>}
    </div>
  );
}
```

### Кастомные условия подавления

```tsx
import { useNetworkControl } from 'common.services';

function CustomComponent() {
  const { setAuthErrorDetected, setAppExiting } = useNetworkControl();

  // Подавить уведомления при определенных условиях
  const handleSensitiveOperation = () => {
    setAuthErrorDetected(true);
    // выполнить операцию
    setTimeout(() => setAuthErrorDetected(false), 3000);
  };
}
```
