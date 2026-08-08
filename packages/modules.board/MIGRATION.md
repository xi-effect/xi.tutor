# Миграция modules.board → xi.tutor (@ibodr/draw)

Пошаговый гайд по переносу папки `my.board` обратно в monorepo **xi.tutor** после ребрендинга SDK `tldraw` → `@ibodr/draw`.

---

## 1. Что изменилось (кратко)

| Область         | Было                                | Стало                                             |
| --------------- | ----------------------------------- | ------------------------------------------------- |
| npm-пакет SDK   | `tldraw`                            | `@ibodr/draw`                                     |
| React-компонент | `Tldraw`                            | `Draw`                                            |
| Типы            | `TLRecord`, `TLShape`, …            | `DrRecord`, `DrShape`, …                          |
| Store API       | `createTLStore`                     | `createDrStore`                                   |
| CSS             | `tldraw/tldraw.css`, `.tl-*`        | `@ibodr/draw/draw.css`, `.dr-*`                   |
| Схема Yjs       | `BOARD_SCHEMA_VERSION = 'tldraw'`   | `'draw'`                                          |
| Clipboard       | `application/tldraw`, `data-tldraw` | `application/draw`, `data-draw` (+ чтение legacy) |

Полная таблица переименований: [`../RENAMING.md`](../RENAMING.md) в репозитории ibodr.

---

## 2. Перенос папки

### 2.1. Скопировать модуль

```bash
# из ibodr
cp -R my.board /path/to/xi.tutor/packages/modules.board
# или заменить существующую папку modules.board
```

Структура модуля **не менялась**: имя пакета по-прежнему `modules.board`, публичный API — через `index.ts`.

### 2.2. Убедиться, что модуль в workspace xi.tutor

В `pnpm-workspace.yaml` xi.tutor должна быть строка вроде:

```yaml
packages:
  - packages/*
  - modules.board # или ваш путь
```

### 2.3. Зависимости в `package.json`

Модуль уже настроен на **опубликованный** SDK:

```json
"@ibodr/draw": "^0.0.0"
```

Остальные `workspace:*` (`common.*`, `features.materials.*`) — пакеты xi.tutor, их **не трогать**.

Добавлены явные зависимости, которые раньше подтягивались транзитивно:

- `sonner` — тосты
- `nanoid` — id таймкодов и фигур

### 2.4. Установка

```bash
cd /path/to/xi.tutor
pnpm install
```

---

## 3. Подключение @ibodr/draw в xi.tutor

### 3.1. npm (production)

Пакеты опубликованы в org **ibodr** на [npmjs.com](https://www.npmjs.com/org/ibodr):

| Пакет                              | Версия (на момент миграции)    |
| ---------------------------------- | ------------------------------ |
| `@ibodr/draw`                      | 0.0.0                          |
| `@ibodr/editor`, `@ibodr/store`, … | 0.0.0 (транзитивно через draw) |
| `@ibodr/utils`                     | 0.0.1                          |

Достаточно зависимости только от `@ibodr/draw` — остальные `@ibodr/*` подтянутся автоматически.

**Важно:** после фикса экспорта `STROKE_SIZES` нужно перепубликовать `@ibodr/draw` как **0.0.1** и обновить в `modules.board`:

```json
"@ibodr/draw": "^0.0.1"
```

До перепубликации `useDrawStyles` упадёт при импорте `STROKE_SIZES` из npm-версии 0.0.0.

### 3.2. Локальная разработка SDK (опционально)

Если параллельно правите ibodr:

```json
"@ibodr/draw": "workspace:*"
```

и добавьте ibodr в workspace xi.tutor **или** используйте `pnpm link`:

```bash
cd ibodr/packages/draw && pnpm link --global
cd xi.tutor/packages/modules.board && pnpm link --global @ibodr/draw
```

При `workspace:*` / link bundler резолвит `"development": "./src/index.ts"` — сборка draw не обязательна.

---

## 4. Изменения в коде xi.tutor (потребители modules.board)

Если где-то **вне** `modules.board` остались старые импорты — заменить:

```ts
// было
import { Tldraw, useEditor, TLRecord } from 'tldraw';
import 'tldraw/tldraw.css';

// стало
import { Draw, useEditor, DrRecord } from '@ibodr/draw';
import '@ibodr/draw/draw.css';
```

Внутри `modules.board` миграция **уже выполнена** — правки в потребителях нужны только если xi.tutor импортировал tldraw напрямую.

### Публичный API modules.board (без изменений)

```ts
import { DrawBoard } from 'modules.board';
import { useYjsStore, useHotkeys, CollaboratorCursor } from 'modules.board';
```

---

## 5. CSS и стили

### 5.1. Обязательный импорт

В `DrawCanvas.tsx` уже есть:

```ts
import '@ibodr/draw/draw.css';
```

Убедитесь, что Vite/bundler xi.tutor обрабатывает CSS из `node_modules`.

### 5.2. Кастомные стили modules.board

Файл `src/ui/components/canvas/customstyles.css` использует классы **`.dr-*`** (не `.tl-*`):

- `.dr-container`, `.dr-resize-handle`, `.dr-selection__fg`, …

Если в xi.tutor остались глобальные переопределения `.tl-*` — заменить на `.dr-*`.

---

## 6. Yjs / Hocuspocus — breaking change

### 6.1. Версия схемы

В `src/utils/yjsConstants.ts`:

```ts
export const BOARD_SCHEMA_VERSION = 'draw';
export const LEGACY_BOARD_SCHEMA_VERSION = 'tldraw';
```

**Старые комнаты** с `schemaVersion = 'tldraw'` и sequence keys `com.tldraw.*` **автоматически мигрируют при первом открытии** в новом клиенте (`migrateLegacyTldrawSnapshot.ts` + `store.schema.migrateStoreSnapshot`).

### 6.2. Стратегии миграции данных

**Вариант A — автоматически (реализовано в modules.board)**

При синхронизации Yjs (`useYjsStore` → `handleSynced`):

1. Определяется legacy-сnapshot (`schemaVersion === 'tldraw'` или `com.tldraw.*` в `meta.schema.sequences`).
2. Префиксы переименовываются: `com.tldraw.*` → `com.draw.*`, `tldraw:*` → `draw:*`.
3. Применяются штатные миграции SDK (`migrateStoreSnapshot`).
4. В Y.Doc записываются актуальные `meta.schema` и `meta.schemaVersion = 'draw'`.

Первый клиент на новом SDK перезаписывает комнату уже в формате draw; остальные участники получают обновление через Hocuspocus.

**Вариант B — ручная / серверная миграция (опционально)**

Если автоматическая миграция не сработала (несовместимые версии sequence, кастомные фигуры):

1. Загрузить snapshot старой доски.
2. Применить те же замены префиксов (см. `migrateLegacyTldrawSnapshot.ts`).
3. Сохранить под новым `roomId` или перезаписать (с бэкапом).

**Вариант C — только новые комнаты**

Создавать новые `roomId` без миграции — если старые доски не нужны.

### 6.3. Env-переменные

`YjsProvider.tsx` ожидает:

```
VITE_SERVER_URL_HOCUS=wss://your-hocuspocus-host
```

Проверьте `.env` xi.tutor.

---

## 7. Кастомные фигуры

| Фигура       | type            | Module augmentation  |
| ------------ | --------------- | -------------------- |
| Xi Geo       | `xi-geo`        | `XiGeoShapeUtil.tsx` |
| Audio        | `audio`         | `AudioShape.ts`      |
| PDF          | `pdf`           | `PdfShape.ts`        |
| Sticker      | extends `note`  | без augmentation     |
| Custom image | extends `image` | без augmentation     |

Augmentation обязателен для корректных типов TypeScript:

```ts
declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    'xi-geo': { borderColor: TColor; text: string };
    audio: AudioShapeProps;
    pdf: PdfShapeProps;
  }
}
```

---

## 8. Clipboard

`useDrawClipboard` и `drawContent.ts`:

- **Запись:** `application/draw`, `data-draw`
- **Чтение:** поддерживаются и `draw`, и legacy `tldraw` форматы

Пользователи смогут вставлять из старых досок tldraw; Yjs-комнаты с `tldraw` мигрируют автоматически при открытии (§6.2A).

---

## 9. Чеклист после переноса

- [ ] `pnpm install` в xi.tutor без ошибок
- [ ] `@ibodr/draw` резолвится из `node_modules` (не `workspace:*`, если используете npm)
- [ ] `@ibodr/draw/draw.css` подключается, доска визуально корректна
- [ ] Открытие **новой** комнаты — рисование, фигуры, PDF, audio
- [ ] Совместное редактирование (2 вкладки) — курсоры, sync
- [ ] Экспорт PNG (`useDropdownActions` → `editor.toImage()`)
- [ ] Вставка из буфера (из draw и legacy tldraw)
- [ ] Hotkeys (`HOTKEYS.md`)
- [ ] Нет ошибок в консоли про missing exports (`STROKE_SIZES` → нужен `@ibodr/draw@0.0.1+`)

---

## 10. Что проверено / исправлено в ibodr

### Исправлено

| Проблема                                           | Решение                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `STROKE_SIZES` не экспортировался из `@ibodr/draw` | Добавлен re-export в `packages/draw/src/index.ts` → нужна перепубликация **0.0.1** |
| Типы `audio` / `pdf` не в `DrShape`                | `declare module '@ibodr/draw'` в `AudioShape.ts`, `PdfShape.ts`                    |
| `sonner`, `nanoid` не в `package.json`             | Добавлены явные dependencies                                                       |

### Не сломано (проверено)

- Все импорты `@ibodr/draw` в modules.board — актуальные API (`Draw`, `createDrStore`, `DrRecord`, …)
- CSS-селекторы переведены на `.dr-*`
- `BOARD_SCHEMA_VERSION = 'draw'`
- Сборка всех `packages/*` в ibodr проходит (`pnpm build`)
- Publish-скрипт и prepack/postpack работают

### Остатки tldraw (намеренно)

Только в **комментариях** и **backward-compatible парсинге** clipboard — на runtime не влияет.

### Известные ограничения

1. **Старые Yjs-комнаты** — автомиграция при открытии (§6.2A); при ошибке `migrateStoreSnapshot` — ручной бэкап (§6.2B).
2. **CDN шрифтов** — SDK по умолчанию может обращаться к `cdn.tldraw.com` (внешний сервис upstream).
3. **`@ibodr/utils@0.0.1`** vs остальные `@0.0.0` — при следующем релизе выровнять версии.
4. **Typecheck modules.board изолированно** в ibodr падает — нет `common.*` в workspace; в xi.tutor с полным monorepo всё резолвится.

---

## 11. Перепубликация @ibodr/draw после фикса

```bash
# в ibodr
# 1. Поднять версию в packages/draw/package.json → 0.0.1
# 2. pnpm publish:packages  (или только draw)
# 3. В xi.tutor/modules.board:
#    "@ibodr/draw": "^0.0.1"
pnpm install
```

---

## 12. Полезные команды

```bash
# xi.tutor — проверка типов модуля (из корня monorepo)
pnpm exec tsc -p packages/modules.board --noEmit

# ibodr — сборка SDK
pnpm build

# ibodr — dry-run публикации
pnpm publish:packages:dry-run
```

---

## 13. Контакты / ссылки

- npm org: https://www.npmjs.com/org/ibodr
- Документация ребрендинга: `ibodr/RENAMING.md`
- Hotkeys: `modules.board/HOTKEYS.md`
- Performance: `modules.board/PERFORMANCE.md`
