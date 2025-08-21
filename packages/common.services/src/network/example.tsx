import { NetworkProvider, useNetworkControl, useNetworkAuthIntegration } from './index';
import { useNetworkStatus } from 'common.utils';

// Пример компонента с кастомным статусом сети
const NetworkStatusExample = () => {
  const { isOnline, isReconnecting } = useNetworkStatus();

  if (isOnline && !isReconnecting) return null;

  return (
    <div className="fixed bottom-4 left-4 rounded-lg bg-gray-800 px-3 py-2 text-white">
      {!isOnline && <span>🔴 Нет соединения</span>}
      {isReconnecting && <span>🟡 Проверка соединения...</span>}
    </div>
  );
};

// Пример компонента с контролем уведомлений
const NotificationControlExample = () => {
  const { suppressNetworkNotifications, enableNetworkNotifications } = useNetworkControl();

  const handleSensitiveOperation = () => {
    suppressNetworkNotifications();
    // Выполняем операцию, которая может вызвать сетевые ошибки
    setTimeout(() => {
      enableNetworkNotifications();
    }, 5000);
  };

  return <button onClick={handleSensitiveOperation}>Выполнить операцию без уведомлений</button>;
};

// Пример компонента авторизации
const AuthExample = () => {
  const { handleAuthError } = useNetworkAuthIntegration();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        handleAuthError({
          response: {
            status: response.status,
            data: error,
          },
        });
        return;
      }

      // Успешная авторизация
      console.log('Успешный вход');
    } catch (error) {
      handleAuthError(error);
    }
  };

  return (
    <button onClick={() => handleLogin({ email: 'test@example.com', password: 'password' })}>
      Войти
    </button>
  );
};

// Основной компонент приложения
export const AppExample = () => {
  return (
    <NetworkProvider suppressNotifications={false}>
      <div className="app">
        <h1>Пример использования сетевой системы</h1>

        <div className="examples">
          <div>
            <h3>Статус сети</h3>
            <NetworkStatusExample />
          </div>

          <div>
            <h3>Контроль уведомлений</h3>
            <NotificationControlExample />
          </div>

          <div>
            <h3>Авторизация</h3>
            <AuthExample />
          </div>
        </div>
      </div>
    </NetworkProvider>
  );
};

export default AppExample;
