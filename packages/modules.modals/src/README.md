# Модуль модальных окон с TanStack Router

Модуль предоставляет удобный способ управления модальными окнами в приложениях, использующих TanStack Router.

## Особенности

- Интеграция с TanStack Router
- Синхронизация состояния модальных окон с URL (через search params)
- Возможность открытия и закрытия модальных окон через URL
- Типизированный API

## Установка

```bash
# Если используется npm
npm install modules.modals

# Если используется yarn
yarn add modules.modals

# Если используется pnpm
pnpm add modules.modals
```

## Использование

### Настройка роутера

```tsx
import { createRouter, createRouteConfig } from '@tanstack/react-router';
import { ModalRouteParams, MODAL_PARAM_NAME } from 'modules.modals';

// Создание корневого маршрута
const rootRoute = createRouteConfig();

// Создание основного маршрута с поддержкой модальных окон через search параметры
const homeRoute = rootRoute.createRoute({
  path: '/',
  validateSearch: (search: Record<string, string>): ModalRouteParams => ({
    modal: search[MODAL_PARAM_NAME],
  }),
  component: () => <HomePage />,
});

// Добавьте другие маршруты по необходимости

// Создание роутера
const routeConfig = rootRoute.addChildren([homeRoute]);
const router = createRouter({ routeConfig });

export default router;
```

### Настройка провайдера

```tsx
import { ModalsProvider } from 'modules.modals';
import { RouterProvider } from '@tanstack/react-router';
import router from './router';
import { ExampleModal } from './modals/ExampleModal';

function App() {
  const initialModals = {
    example: ExampleModal,
    // Добавьте другие модальные окна по необходимости
  };

  return (
    <RouterProvider router={router}>
      <ModalsProvider initialModals={initialModals} router={router}>
        <div className="app">{/* Ваш основной контент */}</div>
      </ModalsProvider>
    </RouterProvider>
  );
}

export default App;
```

### Использование хука useModals

```tsx
import { useModals } from 'modules.modals';

function MyComponent() {
  const { navigateToModal, closeModal } = useModals();

  const handleOpenModal = () => {
    navigateToModal('example', { message: 'Привет из модального окна!' });
  };

  return (
    <div>
      <button onClick={handleOpenModal}>Открыть модальное окно</button>
      {/* Другие компоненты */}
    </div>
  );
}
```

### Создание собственного модального окна

```tsx
import { BaseModal } from 'modules.modals';

interface CustomModalProps {
  title?: string;
  message?: string;
  onConfirm?: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  title = 'Заголовок',
  message = 'Содержание модального окна',
  onConfirm,
}) => {
  return (
    <BaseModal title={title}>
      <div style={{ marginBottom: '20px' }}>{message}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            background: 'blue',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={onConfirm}
        >
          Подтвердить
        </button>
      </div>
    </BaseModal>
  );
};
```

## API

### ModalsProvider

Провайдер, необходимый для использования модальных окон.

#### Props

- `children`: React ноды, которые будут обёрнуты провайдером
- `initialModals`: Объект с начальными модальными окнами, где ключ - имя модального окна, а значение - компонент
- `router`: Экземпляр роутера TanStack Router

### useModals

Хук для управления модальными окнами.

#### Возвращаемые значения

- `navigateToModal(name, props)`: Функция для открытия модального окна
- `closeModal()`: Функция для закрытия модального окна
- `registerModal(name, component)`: Функция для регистрации модального окна
- `getModalProps(name)`: Функция для получения пропсов модального окна

### BaseModal

Базовый компонент модального окна.

#### Props

- `title`: Заголовок модального окна
- `children`: Содержимое модального окна
- `onClose`: Коллбэк, вызываемый при закрытии модального окна

### ExampleModal

Пример модального окна.

#### Props

- `message`: Сообщение, отображаемое в модальном окне
- `onConfirm`: Коллбэк, вызываемый при подтверждении
