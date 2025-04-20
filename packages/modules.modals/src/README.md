# Модуль модальных окон

Этот модуль предоставляет централизованное управление модальными окнами в приложении с сохранением состояния в URL.

## Особенности

- Отслеживание состояния модальных окон в URL через параметры
- Централизованное управление модальными окнами через React Context
- Возможность открытия и закрытия модальных окон из любой части приложения
- Поддержка регистрации модальных окон как при инициализации, так и во время работы приложения

## Установка и использование

### 1. Инициализация провайдера

В корне вашего приложения оберните его в `ModalsProvider`:

```tsx
import { ModalsProvider } from 'modules.modals';
import { YourCustomModal } from './components/YourCustomModal';

const App = () => {
  // Предварительная регистрация модальных окон
  const initialModals = {
    'custom-modal': YourCustomModal,
  };

  return (
    <ModalsProvider initialModals={initialModals}>
      <YourApp />
    </ModalsProvider>
  );
};

export default App;
```

### 2. Создание собственного модального окна

```tsx
import { BaseModal } from 'modules.modals';

interface CustomModalProps {
  title?: string;
  // Ваши собственные пропсы
}

export const CustomModal: React.FC<CustomModalProps> = ({
  title = 'Название по умолчанию',
  // Другие пропсы
}) => {
  return (
    <BaseModal title={title}>
      {/* Содержимое модального окна */}
      <p>Ваше содержимое</p>
    </BaseModal>
  );
};
```

### 3. Использование хука `useModals` для управления модальными окнами

```tsx
import { useModals } from 'modules.modals';

const YourComponent = () => {
  const { openModal, closeModal, isModalOpen, registerModal } = useModals();

  // Регистрация модального окна (если не было зарегистрировано ранее)
  useEffect(() => {
    registerModal('dynamic-modal', DynamicModal);
  }, [registerModal]);

  const handleOpenModal = () => {
    // Открытие модального окна с передачей пропсов
    openModal('custom-modal', { title: 'Особый заголовок' });
  };

  return (
    <div>
      <button onClick={handleOpenModal}>Открыть модальное окно</button>

      {/* Пример проверки состояния */}
      {isModalOpen('custom-modal') && <p>Модальное окно открыто</p>}
    </div>
  );
};
```

## API

### ModalsProvider

Компонент-провайдер для управления модальными окнами.

**Пропсы:**

- `children`: React-узлы
- `initialModals`: Объект с начальными модальными окнами в формате `{ [ключ: string]: React.ComponentType }`

### useModals

React-хук, предоставляющий методы для управления модальными окнами.

**Возвращает объект со следующими методами:**

- `openModal(name: string, props?: object)`: Открывает модальное окно с указанным именем и опциональными пропсами
- `closeModal()`: Закрывает текущее открытое модальное окно
- `registerModal(name: string, component: React.ComponentType)`: Регистрирует новое модальное окно
- `isModalOpen(name: string)`: Проверяет, открыто ли указанное модальное окно
- `getModalProps(name: string)`: Возвращает текущие пропсы для указанного модального окна

### BaseModal

Базовый компонент модального окна для наследования.

**Пропсы:**

- `title`: Заголовок модального окна
- `children`: Содержимое модального окна
- `onClose`: Обработчик закрытия модального окна (опционально)
