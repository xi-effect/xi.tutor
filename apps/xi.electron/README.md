# xi.electron

Desktop-оболочка Sovlium на Electron для **macOS** и **Windows**. Renderer — существующий `apps/xi.web`. Отдельной копии приложения, роутов, доски, редактора, звонков или API-клиентов здесь нет.

```
                    xi.web
        React / Vite / TanStack Router
        tldraw / TipTap / LiveKit / API
                       │
             ┌─────────┴─────────┐
             │                   │
           Browser            Electron
                           macOS / Windows
```

## Зачем Electron

Для macOS/Windows нужна оболочка с полноценным Chromium: `WebContentsView`, перенос одного LiveKit-контекста между окнами, системный screen capture и cookie-origin `https://app.sovlium.ru` при локальном frontend.

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
session.fromPartition('persist:sovlium');
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

macOS: DMG и ZIP, arm64 и x64. Universal по-прежнему отдельно: `pnpm electron:build:macos:universal`.  
Windows: NSIS `.exe` x64 (`Sovlium-Setup-<version>.exe`), uninstall, AppUserModelId `ru.sovlium.electron.dev`.  
Linux на первом этапе не собирается.

Публикация в GitHub Releases `xi-effect/xi.tutor` (draft, тег `electron-vX.Y.Z`):

```bash
pnpm electron:publish:windows
pnpm electron:publish:macos
```

Обычно это делает `.github/workflows/electron-release.yml` после `git push origin electron-vX.Y.Z`. Версия тега должна совпадать с `apps/xi.electron/package.json`.

Подпись macOS пока ad-hoc (`mac.identity: '-'`), без Developer ID и нотаризации. Без подписи вообще Gatekeeper называет скачанное приложение «повреждённым». С ad-hoc подписью при первом запуске macOS пишет, что не может проверить разработчика. Открыть: «Системные настройки» → «Конфиденциальность и безопасность» → «Всё равно открыть». Или через терминал: `xattr -dr com.apple.quarantine /Applications/Sovlium.app`.

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

Только packaged main process (`app.isPackaged`). В dev updater не стартует.

Лента — GitHub Releases этого репозитория, теги `electron-v*`. `latest.yml` / `latest-mac.yml` создаёт electron-builder.

- **Windows:** проверка, фоновое скачивание, в `xi.web` кнопка «Перезапустить и обновить» → `quitAndInstall()`. Принудительного перезапуска нет. Проверка подписи обновления выключена, пока нет сертификата (`verifyUpdateCodeSignature: false`).
- **macOS:** только «Доступна новая версия» и открытие страницы GitHub Release. Автоустановка выключена, пока приложение не подписано и не нотаризовано.

## IPC

Renderer видит только `window.sovliumDesktop`. Каждый канал типизирован, валидирует аргументы и sender/frame. Произвольный shell/file command недоступен.

Маркеры preload:

- `window.__SOVLIUM_NATIVE__`
- `window.__SOVLIUM_NATIVE_OS__`
- `window.__SOVLIUM_ELECTRON__`
- `window.__SOVLIUM_ELECTRON_SURFACE__` — `main` | `conference`

`common.platform` определяет runtime централизованно: `browser` | `electron`.
