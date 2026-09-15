# xi.electron

Desktop-оболочка Sovlium на Electron для **macOS** и **Windows**. Renderer — существующий `apps/xi.web`. Отдельной копии приложения, роутов, доски, редактора, звонков или API-клиентов здесь нет.

```
                    xi.web
        React / Vite / TanStack Router
        tldraw / TipTap / LiveKit / API
                       │
             ┌─────────┴─────────┐
             │                   │
           Browser            Native shells
                                  │
                         ┌────────┴────────┐
                         │                 │
                     Electron           Tauri
                     desktop            mobile
                  macOS / Windows     iOS / Android
```

`apps/xi.tauri` не удаляется и не ломается. Electron добавляется параллельно.

## Зачем Electron

Tauri desktop остаётся в репозитории, но для macOS/Windows нужна оболочка с полноценным Chromium: `WebContentsView`, перенос одного LiveKit-контекста между окнами, системный screen capture и cookie-origin `https://app.sovlium.ru` при локальном frontend.

Отличие от Tauri:

| | Electron | Tauri desktop |
| --- | --- | --- |
| Runtime | Chromium | WKWebView / WebView2 |
| Frontend | bundled `xi.web` | свой Vite-shell с alias на `xi.web` |
| Production origin | `https://app.sovlium.ru` через protocol interception | remote `*.sovlium.ru` или `tauri://` |
| Плавающий звонок | тот же `WebContentsView` переносится в always-on-top окно | главное окно сжимается (Document PiP shim) |
| Identifier | `ru.sovlium.electron.dev` (параллельная разработка) | `ru.sovlium.app` |

Перед реальной миграцией desktop отдельно решить, наследует ли Electron `ru.sovlium.app`.

## Архитектура

- **main** — окна, session, IPC, permissions, protocol handler, updater stub.
- **preload** — `contextBridge.exposeInMainWorld('sovliumDesktop', …)`. Renderer не получает `ipcRenderer`.
- **renderer** — `apps/xi.web`. Node API в renderer нет.

Безопасность всех sovlium renderer:

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- `webSecurity: true`

Top-level navigation только на `https://app.sovlium.ru` (и localhost в development). Внешние URL открываются через `shell.openExternal` после проверки схемы.

## Production: локальный frontend + origin app.sovlium.ru

Production **не** делает `loadURL('https://app.sovlium.ru')` как единственный источник UI.

Сборка `xi.web` кладётся в пакет:

```
Sovlium.app/Contents/Resources/web/
  index.html
  assets/
  math-bank/
  ...
```

При запуске `session.protocol.handle('https', …)` отдаёт локальные файлы **только** для `app.sovlium.ru`. Остальные HTTPS-запросы идут в Chromium:

```ts
ses.fetch(request, { bypassCustomProtocolHandlers: true });
```

Поэтому `location.origin === 'https://app.sovlium.ru'`, cookie-based auth не переписывается, а само приложение открывается даже если сайт недоступен (offline UI). Интернет нужен для REST, Socket.IO, LiveKit, Yjs/Hocuspocus и файлов.

SPA fallback: navigation routes получают `index.html`; реальные файлы (`/assets`, `/math-bank`, WASM, gzip) читаются с диска. Path traversal блокируется.

Loader не завязан на один каталог:

1. `userData/web-cache/current` — будущий проверенный bundle
2. bundled `Resources/web` — fallback

Пока нет signed manifest, remote JS **не скачивается**.

## Cookies / persist:sovlium

Все sovlium renderer используют одну session:

```ts
session.fromPartition('persist:sovlium')
```

signin → `Set-Cookie` от `api.sovlium.ru` → Chromium Session → REST, Socket.IO, другие окна, перезапуск. HttpOnly cookie не читаются из JS и не гоняются через IPC.

Socket.IO остаётся браузерным клиентом в renderer (`withCredentials: true`). Origin — `https://app.sovlium.ru`.

## Development

Из корня:

```bash
pnpm electron:dev
```

Electron грузит `http://localhost:5173` (Vite HMR `xi.web`). Если dev-сервер уже запущен, оболочка подключается к нему. Авторизация — тот же `.env.local` / `VITE_ENABLE_X_TESTING`, что и у `xi.web`.

Отладочный remote mode (не production default):

```bash
SOVLIUM_ELECTRON_REMOTE_URL=https://app.sovlium.ru pnpm electron:dev
```

## Production build

```bash
pnpm electron:build
pnpm electron:build:macos
pnpm electron:build:macos:universal
pnpm electron:build:windows
```

Сначала собирается `xi.web` в режиме `electron` (`vite build --mode electron`): minify и code splitting как в production, **без** PWA Service Worker.

macOS по умолчанию — текущая архитектура (на Apple Silicon это arm64: `.app` + `.dmg`). Universal (arm64 + x64) почти удваивает размер из‑за двух копий Chromium: `pnpm electron:build:macos:universal`.  
Windows: NSIS `.exe` x64, uninstall, AppUserModelId `ru.sovlium.electron.dev`.  
Linux на первом этапе не собирается.

Signing / notarization через env (`CSC_LINK`, `APPLE_ID`, …). Секреты в репозиторий не кладутся.

## Conference WebContentsView

Один Chromium-контекст конференции, один LiveKit Room.

1. Основной `xi.web` в Electron **не** создаёт LiveKit Room.
2. `conference.start({ classroomId })` создаёт `WebContentsView` с маршрутом `/desktop/conference/:classroomId`.
3. React через `ResizeObserver` сообщает `conference.setSlotBounds`.
4. Floating mode **переносит тот же view** в always-on-top окно. View не уничтожается, LiveKit не reconnect'ится.
5. Закрытие floating возвращает view в слот. Explicit Leave уничтожает view.
6. Close главного окна во время звонка: main hide, конференция остаётся в floating.

## Screen share

`navigator.mediaDevices.getDisplayMedia()` + `session.setDisplayMediaRequestHandler` (системный picker где доступен). Панель «Вы демонстрируете экран / Остановить» — изолированное always-on-top окно в main process: без `xi.web`, без `persist:sovlium` и без preload. Stop уходит в conference view событием, LiveKit останавливает трек там.

## Updater

- **Web bundle:** abstraction `resolveWebBundle()`, без download до появления signed feed.
- **Electron shell:** `electron-updater` подключается только если задан `SOVLIUM_ELECTRON_UPDATE_FEED`. Endpoint Tauri `releases.sovlium.ru/desktop` **не используется**.

## IPC

Renderer видит только `window.sovliumDesktop`. Каждый канал типизирован, валидирует аргументы и sender/frame. Произвольный shell/file command недоступен.

Маркеры preload:

- `window.__SOVLIUM_NATIVE__`
- `window.__SOVLIUM_NATIVE_OS__`
- `window.__SOVLIUM_ELECTRON__`
- `window.__SOVLIUM_ELECTRON_SURFACE__` — `main` | `conference`

`common.platform` определяет runtime централизованно: `browser` | `tauri` | `electron`. Tauri API импортируются только при `runtime === tauri`.
