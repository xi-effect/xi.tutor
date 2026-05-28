# Подключение и работа с xi.calls

Руководство для разработчиков xi.tutor: как подключить пакеты видеосвязи из соседнего репозитория **xi.calls**, разрабатывать с HMR и не сломать стили, типы и runtime.

## Зачем два репозитория

| Репозиторий                             | Роль                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| **xi.calls**                            | Разработка и публикация npm-пакетов `@xipkg/calls-*` (UI, хуки, store, провайдеры)      |
| **xi.tutor / `packages/modules.calls`** | Тонкий интеграционный слой: адаптеры к `common.services`, `common.env`, TanStack Router |

Calls-пакеты **не знают** про API xi.tutor, env-переменные и роутер. Хост передаёт зависимости через провайдеры (`CallsProvider`, `CallsRuntimeConfigProvider`, `CallsNavigationProvider`).

Подробная карта миграции с монолита: `xi.calls/docs/migrations/xi-tutor-modules-calls.md`.

---

## Структура на диске

Предполагается, что оба репозитория лежат рядом:

```
xi.effect/
├── xi.calls/                    ← исходники @xipkg/calls-*
│   └── packages/
│       ├── calls/
│       ├── calls.ui/
│       ├── calls.chat/
│       └── …
└── xi.tutor/                    ← это приложение
    ├── apps/xi.web/
    └── packages/modules.calls/  ← link: на xi.calls/packages/*
```

Путь в `link:` от `packages/modules.calls/`:

```
link:../../../xi.calls/packages/calls
```

---

## Карта пакетов

| npm-пакет                  | Назначение                                                   |
| -------------------------- | ------------------------------------------------------------ |
| `@xipkg/calls-types`       | Общие типы (`StartCallDataT`, noise cancellation и т.д.)     |
| `@xipkg/calls-config`      | Константы сетки, onboarding, audio options                   |
| `@xipkg/calls-utils`       | Утилиты LiveKit, chat, sounds                                |
| `@xipkg/calls-store`       | Zustand: `useCallStore`, `useFeaturesStore`, …               |
| `@xipkg/calls-providers`   | `RoomProvider`, `LiveKitProvider`, порты для хоста           |
| `@xipkg/calls-hooks`       | `useStartCall`, `useModeSync`, noise cancellation, …         |
| `@xipkg/calls-ui`          | UI-компоненты: VideoGrid, BottomBar, Settings, …             |
| `@xipkg/calls-chat`        | Чат в звонке                                                 |
| `@xipkg/calls-risehand`    | «Поднять руку»                                               |
| `@xipkg/calls-compactview` | Compact overlay + PiP                                        |
| `@xipkg/calls`             | Точка входа full-screen ВКС: `Call`, `PreJoin`, `ActiveRoom` |

Граф зависимостей (снизу вверх):

```
calls-types → config, utils → store → providers → hooks
  → ui, chat, risehand → compactview → calls
```

---

## Архитектура в xi.tutor

### `packages/modules.calls`

После миграции модуль — ~6 файлов-адаптеров:

```
packages/modules.calls/
├── index.ts                          # реэкспорт из @xipkg/calls-* + CallsShell
├── package.json                      # link: или npm-версии
└── src/
    ├── CallsShell.tsx                # дерево провайдеров + CSS
    ├── useCallsDeps.ts               # common.services → CallsProviderDepsT
    ├── createCallsRuntimeConfig.ts   # common.env → LiveKit / noise config
    ├── useTanstackCallsNavigation.ts # TanStack Router → CallsNavigationT
    └── callsSession.ts               # сброс UI чата при disconnect
```

### Публичный API (`index.ts`)

```ts
export { Call } from '@xipkg/calls';
export { CompactView } from '@xipkg/calls-compactview';
export { CallsShell } from './src/CallsShell';
// + провайдеры, хуки, store
```

### Интеграция в приложении

**`apps/xi.web/src/pages/(app)/_layout.tsx`**

- Весь защищённый layout оборачивается в `<CallsShell>`.
- Хуки calls (`useUmamiActivityHeartbeat`, `useCallStore`) вызываются **внутри** `CallsShell`, не снаружи.
- `<CompactView>` рендерится только когда есть `token` в store — иначе `PiPProvider` падает без `LiveKitRoom`.

**`apps/xi.web/src/pages/(app)/_layout/call/$callId.tsx`**

```tsx
const CallModule = lazy(() => import('modules.calls').then((m) => ({ default: m.Call })));
```

---

## Режимы подключения

### Вариант A — локальный link (рекомендуется для разработки)

В `packages/modules.calls/package.json` все `@xipkg/calls-*` указывают на соседний репозиторий:

```json
{
  "dependencies": {
    "@xipkg/calls": "link:../../../xi.calls/packages/calls",
    "@xipkg/calls-ui": "link:../../../xi.calls/packages/calls.ui"
  }
}
```

**Плюсы:** Vite компилирует исходники `index.ts` напрямую, HMR при правках в `xi.calls`.

**Минусы:** нужны доп. настройки Vite и Tailwind (см. ниже).

### Вариант B — npm (CI / прод / без xi.calls на диске)

Заменить `link:` на версии с registry:

```json
"@xipkg/calls": "^0.0.0"
```

После `pnpm install` Vite резолвит `dist/` из `node_modules`. Локальные настройки в `vite.calls-local.ts` применяются только в `mode === 'development'` — для npm-сборки они не мешают.

Эталон link-зависимостей: `xi.calls/docs/migrations/xi-tutor-examples/package.link.json`.

---

## Первичная настройка

### 1. Клонировать и установить оба репозитория

```bash
# xi.calls — один раз перед первым link
cd ../xi.calls
pnpm install
pnpm exec turbo run build --filter='./packages/calls...'
```

`turbo build` нужен для `.d.ts` в `dist/`. Runtime в dev идёт из `index.ts`, но TypeScript в IDE читает типы из `dist/`.

### 2. Установить xi.tutor

```bash
cd ../xi.tutor
pnpm install
```

### 3. Запустить dev-сервер

```bash
pnpm --filter xi.web dev
# или из apps/xi.web: pnpm dev
```

---

## Vite: HMR и резолв linked-пакетов

Конфиг вынесен в `apps/xi.web/vite.calls-local.ts` и подмешивается в `vite.config.ts` только в development.

### Что делает `callsLocalDevConfig`

| Настройка                                       | Зачем                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `resolve.conditions: ['development', 'import']` | Резолв `exports.development` → `./index.ts`, а не `dist/`                                    |
| `optimizeDeps.exclude: CALLS_PACKAGES`          | Не пре-бандлить calls — иначе HMR не видит правки                                            |
| `optimizeDeps.entries`                          | Пре-бандлить calls-граф заранее, чтобы lazy-import layout не ломался                         |
| `CALLS_RUNTIME_DEPS` в `optimizeDeps.include`   | livekit, dnd-kit, zustand и т.д. — пре-бандл сразу, без дооптимизации на первом заходе в ВКС |
| `server.fs.allow`                               | Читать файлы из `../xi.calls/packages`                                                       |
| `server.watch.ignored`                          | Следить за изменениями в `node_modules/@xipkg/calls-*`                                       |
| `resolve.dedupe: ['react', …]`                  | Один экземпляр React (Invalid hook call)                                                     |
| `alias['@xipkg/switcher']`                      | calls-ui ждёт `Switch` из switcher@3; в xi.tutor hoisted switcher@4                          |

Эталон: `xi.calls/docs/migrations/xi-tutor-examples/vite.calls-local.ts`.

### Транзитивные runtime-зависимости

При link Vite компилирует **исходники** xi.calls, а не их `dist/`. Транзитивные deps (livekit, framer-motion, …) должны быть доступны из `node_modules` xi.tutor — они перечислены в `packages/modules.calls/package.json`.

`@xipkg/*` из `CALLS_RUNTIME_DEPS` **не** включаются в пре-бандл: иначе подтягиваются не те версии из корня monorepo.

---

## Tailwind: стили calls в dev

UI calls использует Tailwind-классы в `.tsx` внутри `xi.calls`. После перехода на link `@source "../../../packages/modules.calls"` сканирует только адаптер (~6 файлов) — **классы ВКС не попадают в CSS**.

В `apps/xi.web/src/index.css` добавлены пути (относительно `apps/xi.web/src/`):

```css
@source "../../../../xi.calls/packages/calls.ui/src";
@source "../../../../xi.calls/packages/calls/src";
@source "../../../../xi.calls/packages/calls.chat/src";
@source "../../../../xi.calls/packages/calls.compactview/src";
@source "../../../../xi.calls/packages/calls.risehand/src";
@source "../../../../xi.calls/packages/calls.hooks/src";
@source "../../../../xi.calls/packages/calls.providers/src";
@source "../../../../xi.calls/packages/calls.ui/node_modules/@xipkg";
@source "../../../../xi.calls/packages/calls/node_modules/@xipkg";
@source "../../../../xi.calls/node_modules/@xipkg";
```

Последние три строки — для `@xipkg/button`, `@xipkg/modal` и др. с версиями, которые calls тянет отдельно от xi.tutor.

**После изменения `@source` перезапустите dev-сервер** — Tailwind v4 перечитывает директивы только при старте.

Эталон: `xi.calls/apps/web/src/index.css`.

---

## CSS, не Tailwind

В `CallsShell.tsx` подключаются глобальные стили:

```tsx
import '@livekit/components-styles';
import '@xipkg/calls-ui/video-security.css';
import '@xipkg/calls-ui/driver.css';
```

`grid.css` подтягивается из компонента `VideoGrid` при первом рендере сетки.

Subpath exports в `@xipkg/calls-ui/package.json`:

```json
"./video-security.css": "./src/styles/video-security.css",
"./driver.css": "./src/styles/driver.css"
```

---

## Ежедневная работа

### Правки UI / логики calls

1. Редактируйте файлы в `../xi.calls/packages/calls.*/src/`.
2. Dev-сервер xi.tutor подхватит изменения через HMR.
3. **`tsup --watch` в xi.calls не нужен** для HMR в xi.tutor.

### Изменили public API (новый export, тип)

```bash
cd ../xi.calls
pnpm exec turbo run build --filter='@xipkg/calls-ui'  # или нужный пакет
```

Runtime обновится из `index.ts`, типы в IDE — из пересобранного `dist/`.

### Проверка, что link работает

В DevTools → Sources импорты `@xipkg/calls-*` должны вести на `.ts`/`.tsx` в `xi.calls/packages/`, а не на `.mjs` из `dist/`.

---

## Env-переменные

Конфиг LiveKit и шумоподавления задаётся в `createCallsRuntimeConfig.ts` из `common.env`:

| Переменная                                | Назначение                     |
| ----------------------------------------- | ------------------------------ |
| `VITE_SERVER_URL_LIVEKIT`                 | URL LiveKit (prod)             |
| `VITE_SERVER_URL_LIVEKIT_DEV`             | URL LiveKit (dev)              |
| `VITE_LIVEKIT_DEV_MODE`                   | Авто-подстановка dev-токена    |
| `VITE_LIVEKIT_DEV_TOKEN`                  | Токен для локальной разработки |
| `VITE_NOISE_CANCELLATION_FEATURE_ENABLED` | Фича шумоподавления            |
| `VITE_ALLOW_KRISP_NOISE_CANCELLATION`     | Krisp filter                   |

---

## Feature flags

В `CallsShell.tsx` при монтировании включаются фичи для xi.tutor:

```ts
useFeaturesStore.getState().setFeatures({
  chat: true,
  raiseHand: true,
  whiteboard: true,
});
```

---

## Откат на npm

1. В `packages/modules.calls/package.json` заменить все `link:` на версии с registry.
2. Убрать или закомментировать `@source` на `xi.calls` в `index.css` (для npm достаточно `@source` на `node_modules/@xipkg/calls-*` или dist, если пакеты публикуют готовый CSS).
3. `pnpm install` в корне xi.tutor.

Локальный Vite-фрагмент можно оставить — в production `callsLocalDevConfig` не применяется.

---

## Troubleshooting

| Симптом                                         | Причина                              | Решение                                                                                          |
| ----------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| HMR не срабатывает при правке в xi.calls        | calls попали в `optimizeDeps`        | `optimizeDeps.exclude`, перезапуск dev, `rm -rf apps/xi.web/node_modules/.vite`                  |
| `403` / outside allowed list                    | Vite не читает xi.calls              | `server.fs.allow` в `vite.calls-local.ts`                                                        |
| Invalid hook call                               | Два экземпляра React                 | `resolve.dedupe` для react                                                                       |
| Импорт `.mjs` из dist                           | Нет condition `development`          | `resolve.conditions: ['development', 'import']`                                                  |
| TS-ошибки типов после изменения API             | Старый `dist/`                       | `turbo build` в xi.calls                                                                         |
| `Switch` is not exported from `@xipkg/switcher` | calls ждёт v3, в monorepo hoisted v4 | alias на `xi.calls/node_modules/@xipkg/switcher` + `"@xipkg/switcher": "3.0.13"` в modules.calls |
| Стили ВКС «сырые», нет Tailwind-классов         | `@source` не покрывает xi.calls      | директивы в `index.css`, перезапуск dev                                                          |
| `Failed to fetch dynamically imported module`   | Дооптимизация deps на лету           | `CALLS_RUNTIME_DEPS` в `optimizeDeps.include`, не использовать `--force` в dev-скрипте           |
| `No room provided` / PiP crash                  | `CompactView` без токена             | Рендерить `CompactView` только при `useCallStore().token`                                        |
| `CallsNavigationProvider is missing`            | Хук calls вне `CallsShell`           | Перенести хук внутрь дерева провайдерers                                                         |

---

## Чего не делать

- Не добавлять `xi.calls` в `pnpm-workspace.yaml` xi.tutor (это другой сценарий — workspace link).
- Не запускать `tsup --watch` в xi.calls только ради HMR в xi.tutor.
- Не менять `exports` в пакетах xi.calls ради xi.tutor — инфраструктура уже рассчитана на condition `development`.
- Не включать `@xipkg/*` в `CALLS_RUNTIME_DEPS` — ломается резолв версий.

---

## Связанные документы

| Документ                   | Где                                                  |
| -------------------------- | ---------------------------------------------------- |
| Миграция modules.calls     | `xi.calls/docs/migrations/xi-tutor-modules-calls.md` |
| Локальный link (вариант A) | `xi.calls/docs/migrations/xi-tutor-local-link.md`    |
| Сборка и publish           | `xi.calls/docs/migrations/calls-build.md`            |
| Эталоны файлов             | `xi.calls/docs/migrations/xi-tutor-examples/`        |
| Runtime config (порты)     | `xi.calls/docs/migrations/calls-runtime-config.md`   |

---

## Чеклист для нового разработчика

- [ ] Репозитории `xi.tutor` и `xi.calls` лежат рядом в `xi.effect/`
- [ ] `pnpm install` + `turbo build --filter='./packages/calls...'` в xi.calls
- [ ] `pnpm install` в xi.tutor
- [ ] `pnpm dev` — приложение стартует без ошибок `fs.allow`
- [ ] Страница ВКС открывается, стили на месте
- [ ] Правка `.tsx` в `xi.calls/packages/calls.ui/src/` обновляет UI без пересборки tsup
- [ ] В DevTools импорты `@xipkg/calls-*` ведут на исходники в xi.calls
