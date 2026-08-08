# Модуль Board

Модуль для совместного редактирования досок на **@ibodr/draw** (форк tldraw) и **Yjs**.

> **Миграция в xi.tutor:** см. [`MIGRATION.md`](./MIGRATION.md)

## Особенности

- **Совместное редактирование** — Yjs + Hocuspocus
- **Курсоры коллаборации** с именами пользователей
- **Интеграция с `useCurrentUser()`** из `common.services`
- **Кастомные фигуры** — PDF, audio, xi-geo, sticker

## Быстрый старт (xi.tutor)

```tsx
import { DrawBoard } from 'modules.board';

function App() {
  return <DrawBoard />;
}
```

## Зависимости

| Пакет                              | Назначение                                      |
| ---------------------------------- | ----------------------------------------------- |
| `@ibodr/draw`                      | SDK редактора (npm: `@ibodr`, см. MIGRATION.md) |
| `yjs`, `@hocuspocus/provider`      | CRDT-синхронизация                              |
| `common.*`, `features.materials.*` | workspace-пакеты xi.tutor                       |
| `@xipkg/*`                         | UI-кит                                          |

## Публичный API

```ts
export { DrawBoard } from 'modules.board';
export { useYjsStore, type CameraState } from 'modules.board';
export { useHotkeys } from 'modules.board';
export { CollaboratorCursor, type CollaboratorCursorProps } from 'modules.board';
```

## useYjsStore

```tsx
const { store, status } = useYjsStore({
  roomId: 'unique-room-id',
  hostUrl: 'wss://hocus.example.com',
  shapeUtils: [],
});
```

Статусы: `loading` | `synced-remote` | `offline`

Автоматически берёт `display_name` / `username` из `useCurrentUser()`.

## CSS

Draw подключает стили внутри `DrawCanvas`:

```ts
import '@ibodr/draw/draw.css';
```

Кастомные переопределения — `src/ui/components/canvas/customstyles.css` (селекторы `.dr-*`).

## Документация

- [`MIGRATION.md`](./MIGRATION.md) — перенос в xi.tutor, breaking changes, чеклист
- [`HOTKEYS.md`](./HOTKEYS.md) — горячие клавишi
- [`PERFORMANCE.md`](./PERFORMANCE.md) — профилирование Yjs
