# Подключение и работа с xi.calls

Руководство для разработчиков xi.tutor: пакеты видеосвязи `@xipkg/calls-*` из репозитория [xi.calls](https://github.com/xi-effect/xi.calls).

**По умолчанию** xi.tutor использует **npm-версии** (`^0.0.1`). Для разработки calls рядом с приложением — одна команда переключает на **local link** с HMR.

## Быстрый старт

```bash
# Обычная работа (npm из registry)
pnpm install
pnpm dev

# Разработка calls в соседнем xi.calls
pnpm calls:deps:link
rm -rf apps/xi.web/node_modules/.vite && pnpm dev

# Вернуться на npm
pnpm calls:deps:npm
rm -rf apps/xi.web/node_modules/.vite && pnpm dev
```

Текущий режим хранится в `packages/modules.calls/.calls-deps-mode` (`npm` или `link`).

---

## Зачем два репозитория

| Репозиторий                             | Роль                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------ |
| **xi.calls**                            | Разработка и публикация npm-пакетов `@xipkg/calls-*`                     |
| **xi.tutor / `packages/modules.calls`** | Тонкий слой: адаптеры к `common.services`, `common.env`, TanStack Router |

Calls-пакеты **не импортируют** API xi.tutor. Хост передаёт зависимости через провайдеры.

Подробная карта миграции: `xi.calls/docs/migrations/xi-tutor-modules-calls.md`.

---

## Переключение npm ↔ link

### Команды (корень xi.tutor)

| Команда                | Действие                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| `pnpm calls:deps:npm`  | `@xipkg/calls-*` → `^0.0.1` с registry, `pnpm install`                   |
| `pnpm calls:deps:link` | `@xipkg/calls-*` → `link:../../../xi.calls/packages/...`, `pnpm install` |

Эквивалент из `packages/modules.calls`:

```bash
pnpm --filter modules.calls deps:npm   # без install
pnpm --filter modules.calls deps:link
```

### Что меняет скрипт

Скрипт `packages/modules.calls/scripts/switch-calls-deps.mjs` обновляет три места:

1. **`packages/modules.calls/package.json`** — зависимости из `calls-deps/npm.dependencies.json` или `calls-deps/link.dependencies.json`
2. **`packages/modules.calls/.calls-deps-mode`** — маркер для Vite (`npm` / `link`)
3. **`apps/xi.web/src/index.css`** — блок между `/* calls-tailwind-sources:start */` и `/* calls-tailwind-sources:end */`

Эталоны зависимостей лежат в `packages/modules.calls/calls-deps/` — их можно править при смене версий или путей link.

### После переключения

```bash
rm -rf apps/xi.web/node_modules/.vite   # сброс кэша Vite
pnpm dev                                 # перезапуск dev-сервера
```

Для **link** дополнительно (один раз или после смены public API):

```bash
cd ../xi.calls
pnpm install
pnpm exec turbo run build --filter='./packages/calls...'
```

---

## Режимы подключения

### npm (по умолчанию)

- Зависимости: `"@xipkg/calls": "^0.0.1"` и т.д.
- Vite резолвит `dist/index.mjs` из `node_modules`
- **Важно:** в dev **не** используется condition `development` — в npm-пакетах есть `exports.development → ./index.ts`, но `index.ts` в tarball нет
- Tailwind сканирует `node_modules/@xipkg/calls-*/dist`
- Транзитивные deps (livekit, zustand, …) приходят из calls-пакетов — в `modules.calls` их не дублируем

### link (локальная разработка xi.calls)

- Зависимости: `link:../../../xi.calls/packages/calls` и т.д.
- Дополнительные runtime-deps в `modules.calls` (livekit, dnd-kit, framer-motion, …) — Vite компилирует **исходники**, не `dist/`
- Vite включает `vite.calls-local.ts`: HMR, `fs.allow`, alias для `@xipkg/switcher@3`
- Tailwind сканирует `../../../../xi.calls/packages/calls.*/src`

Структура на диске для link:

```
xi.effect/
├── xi.calls/
│   └── packages/calls*, calls.ui, …
└── xi.tutor/
    └── packages/modules.calls/
```

---

## Карта пакетов

| npm-пакет                  | Назначение                                       |
| -------------------------- | ------------------------------------------------ |
| `@xipkg/calls-types`       | Общие типы                                       |
| `@xipkg/calls-config`      | Константы сетки, onboarding                      |
| `@xipkg/calls-utils`       | Утилиты LiveKit, chat, sounds                    |
| `@xipkg/calls-store`       | Zustand: `useCallStore`, `useFeaturesStore`, …   |
| `@xipkg/calls-providers`   | `RoomProvider`, `LiveKitProvider`, порты         |
| `@xipkg/calls-hooks`       | `useStartCall`, `useModeSync`, …                 |
| `@xipkg/calls-ui`          | VideoGrid, BottomBar, Settings, …                |
| `@xipkg/calls-chat`        | Чат в звонке                                     |
| `@xipkg/calls-risehand`    | «Поднять руку»                                   |
| `@xipkg/calls-compactview` | Compact overlay + PiP                            |
| `@xipkg/calls`             | Full-screen ВКС: `Call`, `PreJoin`, `ActiveRoom` |

---

## Архитектура в xi.tutor

```
packages/modules.calls/
├── .calls-deps-mode              # npm | link
├── calls-deps/                   # эталоны для switch-calls-deps.mjs
├── scripts/switch-calls-deps.mjs
├── index.ts
└── src/
    ├── CallsShell.tsx
    ├── useCallsDeps.ts
    ├── createCallsRuntimeConfig.ts
    ├── useTanstackCallsNavigation.ts
    └── callsSession.ts
```

### Интеграция в приложении

- **`apps/xi.web/src/pages/(app)/_layout.tsx`** — `<CallsShell>`, `CompactView` только при наличии `token`
- **`apps/xi.web/src/pages/(app)/_layout/call/$callId.tsx`** — lazy `Call`

---

## Vite

`apps/xi.web/vite.config.ts` читает `.calls-deps-mode`:

| Режим  | Поведение                                                                             |
| ------ | ------------------------------------------------------------------------------------- |
| `npm`  | `resolve.conditions` без `development`; `callsLocalDevConfig` **выключен**            |
| `link` | `development` + `import`; merge `vite.calls-local.ts` (HMR, fs.allow, switcher alias) |

Подробности link-режима: `apps/xi.web/vite.calls-local.ts`, эталон в `xi.calls/docs/migrations/xi-tutor-examples/`.

---

## Tailwind

Блок `@source` для calls переключается скриптом в `apps/xi.web/src/index.css`.

- **npm:** `node_modules/@xipkg/calls-*/dist` (className в бандле `.mjs`)
- **link:** исходники `xi.calls/packages/calls.*/src`

После смены режима — перезапуск dev-сервера.

---

## CSS (не Tailwind)

В `CallsShell.tsx`:

```tsx
import '@livekit/components-styles';
import '@xipkg/calls-ui/video-security.css';
import '@xipkg/calls-ui/driver.css';
```

---

## Обновление версий calls на npm

1. Опубликовать новую версию в xi.calls
2. Обновить версии в `packages/modules.calls/calls-deps/npm.dependencies.json`
3. `pnpm calls:deps:npm` (или вручную `pnpm update @xipkg/calls@…` в modules.calls)

---

## Env-переменные

Задаются в `createCallsRuntimeConfig.ts` из `common.env`:

| Переменная                                | Назначение                     |
| ----------------------------------------- | ------------------------------ |
| `VITE_SERVER_URL_LIVEKIT`                 | URL LiveKit (prod)             |
| `VITE_SERVER_URL_LIVEKIT_DEV`             | URL LiveKit (dev)              |
| `VITE_LIVEKIT_DEV_MODE`                   | Dev-токен автоматически        |
| `VITE_LIVEKIT_DEV_TOKEN`                  | Токен для локальной разработки |
| `VITE_NOISE_CANCELLATION_FEATURE_ENABLED` | Шумоподавление                 |
| `VITE_ALLOW_KRISP_NOISE_CANCELLATION`     | Krisp filter                   |

---

## Troubleshooting

| Симптом                              | Режим | Решение                                                               |
| ------------------------------------ | ----- | --------------------------------------------------------------------- |
| `Failed to resolve entry … index.ts` | npm   | Убедиться, что `.calls-deps-mode` = `npm`, перезапустить dev          |
| HMR не работает в xi.calls           | link  | `pnpm calls:deps:link`, проверить `optimizeDeps.exclude`              |
| `403` / outside allowed list         | link  | `server.fs.allow` в `vite.calls-local.ts`                             |
| `Switch` is not exported             | link  | alias `@xipkg/switcher` в `vite.calls-local.ts`                       |
| Стили ВКС без Tailwind               | оба   | проверить блок `calls-tailwind-sources` в `index.css`, перезапуск dev |
| TS-ошибки типов                      | link  | `turbo build` в xi.calls                                              |
| `No room provided` / PiP             | оба   | `CompactView` только при `token`                                      |
| `CallsNavigationProvider is missing` | оба   | хуки calls внутри `CallsShell`                                        |

---

## Чего не делать

- Не добавлять `xi.calls` в `pnpm-workspace.yaml` xi.tutor
- Не править `package.json` calls-зависимостей вручную — используй `calls:deps:*`
- Не использовать `resolve.conditions: ['development']` в npm-режиме
- Не включать `@xipkg/*` в `CALLS_RUNTIME_DEPS`

---

## Связанные документы

| Документ               | Где                                                  |
| ---------------------- | ---------------------------------------------------- |
| Миграция modules.calls | `xi.calls/docs/migrations/xi-tutor-modules-calls.md` |
| Локальный link         | `xi.calls/docs/migrations/xi-tutor-local-link.md`    |
| Сборка и publish       | `xi.calls/docs/migrations/calls-build.md`            |
| Эталоны                | `xi.calls/docs/migrations/xi-tutor-examples/`        |

---

## Чеклист

**npm (обычный dev):**

- [ ] `pnpm install && pnpm dev`
- [ ] `.calls-deps-mode` содержит `npm`
- [ ] ВКС открывается, стили на месте

**link (разработка calls):**

- [ ] `xi.calls` рядом с `xi.tutor`
- [ ] `pnpm calls:deps:link`
- [ ] `turbo build --filter='./packages/calls...'` в xi.calls
- [ ] HMR при правке `xi.calls/packages/calls.ui/src/`
- [ ] DevTools: импорты ведут на `.tsx` в xi.calls, не на `.mjs` из dist
