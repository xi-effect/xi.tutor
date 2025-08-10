# Модуль Board

Модуль для совместного редактирования досок с использованием TLDraw и Yjs.

## Особенности

- **Совместное редактирование в реальном времени** с использованием Yjs и Hocuspocus
- **Курсоры коллаборации** с отображением имен пользователей
- **Интеграция с системой аутентификации** - автоматическое использование `display_name` из `useCurrentUser()`
- **Уникальные цвета для каждого пользователя** - генерируются на основе ID пользователя

## Использование

### Базовое использование

```tsx
import { TldrawBoard } from 'modules.board';

function App() {
  return <TldrawBoard />;
}
```

### Интеграция с пользовательскими данными

Модуль автоматически интегрируется с `useCurrentUser()` из `common.services`:

```tsx
import { useYjsStore } from 'modules.board';
import { useCurrentUser } from 'common.services';

function CustomBoard() {
  const { data: currentUser } = useCurrentUser();
  const { store, status } = useYjsStore({
    roomId: 'my-room',
    hostUrl: 'wss://hocus.sovlium.ru',
  });

  // useYjsStore автоматически использует:
  // - currentUser.display_name для отображения имени в курсоре
  // - currentUser.username как fallback если display_name не задан
  // - Генерирует уникальный цвет на основе currentUser.id

  return <Tldraw store={store} />;
}
```

### Курсоры коллаборации

Компонент `CollaboratorCursor` автоматически отображает:

- Иконку курсора с уникальным цветом пользователя
- Имя пользователя (`display_name` или `username`)
- Позицию курсора в реальном времени

```tsx
import { CollaboratorCursor } from 'modules.board';

// Используется автоматически в TldrawCanvas
<Tldraw
  components={{
    CollaboratorCursor: CollaboratorCursor,
  }}
/>;
```

## Конфигурация

### Параметры useYjsStore

```tsx
const { store, status } = useYjsStore({
  roomId: 'unique-room-id', // ID комнаты для совместного редактирования
  hostUrl: 'wss://hocus.sovlium.ru', // URL Hocuspocus сервера
  shapeUtils: [], // Дополнительные утилиты для фигур
});
```

### Статусы подключения

- `loading` - Загрузка и инициализация
- `synced-remote` - Синхронизировано с удаленным сервером
- `offline` - Отключено от сервера

## Архитектура

### Основные компоненты

- `useYjsStore` - Хук для управления Yjs store и awareness
- `TldrawCanvas` - Основной компонент доски
- `CollaboratorCursor` - Компонент курсора коллаборации
- `TldrawBoard` - Обертка с удалением водяных знаков

### Интеграция с пользователями

Модуль автоматически:

1. Получает данные текущего пользователя через `useCurrentUser()`
2. Использует `display_name` или `username` для отображения в курсоре
3. Генерирует уникальный цвет на основе ID пользователя
4. Синхронизирует presence через Yjs awareness

### Цветовая схема

Цвета генерируются детерминированно на основе ID пользователя:

```tsx
function generateUserColor(userId: string): string {
  const hash = Array.from(userId).reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
```

## Зависимости

- `tldraw` - Основная библиотека для редактирования
- `yjs` - CRDT для синхронизации
- `@hocuspocus/provider` - WebSocket провайдер
- `common.services` - Для получения данных пользователя
- `common.ui` - UI компоненты (LoadingScreen)
