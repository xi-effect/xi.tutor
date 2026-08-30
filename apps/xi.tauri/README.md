# xi.tauri

Нативная оболочка Sovlium на базе Tauri v2: единая кодовая база UI с `xi.web`,
платформенные сборки под Windows, macOS, iOS, Android, безопасный
self-updater для desktop.

## Архитектура

```
apps/xi.tauri/
├── package.json            — pnpm-пакет workspace’а, тонкая обёртка над xi.web
├── tsconfig.json           — расширяет packages/common.typescript, добавляет alias web/* -> ../xi.web/src/*
├── vite.config.ts          — конфиг Vite, заточен под Tauri (порт 1420, target safari14/chrome105)
├── index.html              — нативный shell, без PWA-хвостов
├── src/
│   ├── main.tsx            — bootstrap (i18n + bugsink из xi.web, platform-init, режим remote)
│   ├── App.tsx             — рендер AppProviders из web/providers
│   ├── env.ts              — Tauri-специфичные env-переменные
│   ├── remote/             — splash → health/compat → navigate на *.sovlium.ru
│   ├── platform/
│   │   ├── index.ts        — detect + init по платформе
│   │   ├── types.ts        — контракт PlatformModule
│   │   ├── desktop.ts      — поднимает auto-updater
│   │   ├── mobile.ts       — store-only обновления
│   │   └── web.ts          — fallback для `vite dev` в браузере
│   └── tauri/
│       ├── commands.ts     — типизированные обёртки invoke (app_info, log_message)
│       ├── permissions.ts  — высокоуровневые гранты (notifications)
│       └── updater.ts      — поток check -> downloadAndInstall -> relaunch
└── src-tauri/
    ├── Cargo.toml          — crate sovlium_lib, плагины (updater/process — только desktop)
    ├── build.rs            — tauri_build
    ├── tauri.conf.json     — общий конфиг (productName, identifier, updater endpoints/pubkey)
    ├── tauri.windows.conf.json   — NSIS + MSI, опциональная подпись
    ├── tauri.macos.conf.json     — macOS bundle (.app по умолчанию без DMG)
    ├── tauri.macos.bundle-installers.conf.json — merge для сборки .app + DMG (CI / релиз)
    ├── tauri.ios.conf.json       — отключает updater, deep-link
    ├── tauri.android.conf.json   — отключает updater, deep-link
    ├── capabilities/
    │   ├── default.json    — базовый ACL (все платформы)
    │   ├── desktop.json    — updater + process (только Windows/macOS/Linux)
    │   ├── remote.json     — IPC для remote UI на app/desktop.sovlium.ru (desktop + mobile)
    │   ├── mobile.json     — уведомления, clipboard, files, opener на iOS/Android
    │   └── share-overlay.json / share-annotate.json — desktop overlay windows
    ├── icons/README.md     — как сгенерировать иконки через `pnpm tauri icon`
    └── src/
        ├── main.rs
        ├── lib.rs          — Builder, плагины, single-instance, generate_handler!
        ├── navigation.rs   — allowlist top-level navigations (*.sovlium.ru)
        ├── share_overlay.rs — Zoom-like always-on-top share control bar
        ├── commands/mod.rs — app_info, log_message, http_probe, save_file
        ├── media.rs        — camera/mic (Apple AVFoundation; Android WebView prompt)
        └── setup/mod.rs    — placeholder под deep-links, tray и т.п.
```

WebAPI, которые в WebView работают иначе, чем в Chrome, живут в
`packages/common.platform`. Production remote UI — это `https://app.sovlium.ru`
внутри WebView, поэтому адаптеры едут вместе с `xi.web`. Один вход:
`installNativeWebApiBridges()`.

| API            | Браузер               | Desktop                    | iOS / Android (в т.ч. планшеты)   |
| -------------- | --------------------- | -------------------------- | --------------------------------- |
| Уведомления    | `Notification`        | `plugin-notification`      | то же                             |
| Скачивание     | `<a download>`        | native Save dialog         | Save dialog, иначе Share sheet    |
| Буфер обмена   | `navigator.clipboard` | `plugin-clipboard-manager` | то же                             |
| Внешние ссылки | `window.open`         | `plugin-opener`            | системный браузер / приложение    |
| Камера / мик   | `getUserMedia`        | TCC / WebView2             | AVFoundation / runtime permission |
| Шаринг экрана  | `getDisplayMedia`     | + overlay                  | нет в WebView (`unsupported`)     |
| PiP звонка     | Chrome Document PiP   | native mini-window         | compact UI, без shim              |

### Принципы

- **Никаких дублей бизнес-логики.** Vite-alias `web/*` указывает на `apps/xi.web/src/*`,
  что позволяет переиспользовать `AppProviders`, `router`, `pages`, `config/i18n`,
  `config/bugsink`, страницы и провайдеры без изменений в самом `xi.web`. То же
  для Tailwind: `src/index.css` импортирует `../../xi.web/src/index.css`, и все
  `@source`-декларации Tailwind v4 продолжают работать.
- **Remote UI в production.** Desktop-сборки по умолчанию открывают
  `https://app.sovlium.ru` (fallback `desktop.sovlium.ru`) после локального splash,
  health-check и `native-compat.json`. Origin same-site с `api.sovlium.ru` —
  session cookie и Socket.IO работают как в браузере. Локальный `frontendDist`
  остаётся для `tauri:dev` и для `VITE_TAURI_REMOTE_MODE=false`.
- **Платформенный слой явный.** Логика оболочки (updater, splash, navigation)
  проходит через `src/platform/*`. WebAPI (clipboard, notifications, files,
  media, openUrl, calls overlay) — через `common.platform`, который смотрит на
  `__SOVLIUM_NATIVE__` / `__SOVLIUM_NATIVE_OS__` / `__TAURI_INTERNALS__`. Никаких разрозненных
  `if (window.__TAURI__)` в бизнес-коде.
- **PWA отключён.** В Tauri service worker’ы не нужны и мешают updater’у.
- **Capabilities-first.** Все плагины с side-effect’ами требуют явного гранта в
  `capabilities/*.json`. Добавление новой возможности — отдельный коммит.

## Требования

| Платформа | Что нужно                                                    |
| --------- | ------------------------------------------------------------ |
| Любой dev | Node 20+, pnpm 10.30+, Rust stable (`rustup default stable`) |
| macOS     | Xcode CLT (`xcode-select --install`)                         |
| Windows   | Microsoft Visual Studio C++ Build Tools, WebView2 Runtime    |
| iOS       | macOS + Xcode + signing identity                             |
| Android   | JDK 17+, Android Studio SDK (API 24+), NDK                   |

## Быстрый старт

```bash
# Из корня репозитория
pnpm install

# Desktop dev (откроет native окно с локальным Vite на :1420)
pnpm tauri:dev

# Desktop production-бандл (на macOS по умолчанию только .app, без DMG):
pnpm tauri:build

# macOS + установочный DMG (если нужен именно DMG):
pnpm --filter xi.tauri build:macos:dmg

# iOS (один раз — инициализация Xcode-проекта)
pnpm --filter xi.tauri ios:init
pnpm tauri:ios:dev

# Android (один раз — инициализация Gradle-проекта)
pnpm --filter xi.tauri android:init
pnpm tauri:android:dev
```

### macOS: `.app` без DMG и отладка DMG

По умолчанию в `tauri.macos.conf.json` указано `bundle.targets: ["app"]`: собирается только **`Sovlium.app`**, без шага **`bundle_dmg.sh`** (на части машин он падает из‑за окружения — например, ограничений `hdiutil`, прав или неполного Xcode).

Чтобы собрать **DMG**, выполните:

```bash
pnpm --filter xi.tauri build:macos:dmg
```

Если DMG снова падает, запустите скрипт вручную с трассировкой и посмотрите первую строку с ошибкой:

```bash
bash -x apps/xi.tauri/src-tauri/target/release/bundle/dmg/bundle_dmg.sh
```

Часто помогают: актуальные **Command Line Tools** (`xcode-select --install`), при необходимости полный **Xcode**, достаточное место на диске и отсутствие блокировок антивирусом на каталог `target/release/bundle/dmg/`.

## Режимы запуска

| Режим            | Когда использовать                          | Как включить                                                      |
| ---------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| remote (prod)    | Production desktop: UI с `*.sovlium.ru`     | `VITE_TAURI_REMOTE_MODE=true` в `.env` (обязательно для release)  |
| local            | Dev HMR, отладка shell без remote           | `pnpm tauri:dev` (`dev:frontend` форсит `REMOTE_MODE=false`)      |
| dev:remote       | Проверить splash → navigate против live app | `pnpm --filter xi.tauri dev:remote`                               |
| local production | Собрать `.app` с зашитым `frontendDist`     | `VITE_TAURI_REMOTE_MODE=false` в `.env`, затем `pnpm tauri:build` |

### Remote UI (почему так)

WKWebView на `tauri://localhost` не сохраняет third-party cookie `Domain=sovlium.ru`
(даже с `SameSite=None`). Поэтому production-shell открывает remote UI на
`https://app.sovlium.ru` (fallback `https://desktop.sovlium.ru`):

1. Локальный splash + preconnect.
2. Budget на desktop updater (пока документ ещё локальный).
3. Health-check primary → fallback.
4. `GET /native-compat.json` (`minShellVersion`); при слишком старой оболочке —
   экран «обновите приложение». Health/compat идут через Rust `http_probe`
   (без CORS WebView).
5. `location.replace` на remote origin.
6. Rust allowlist: top-level navigation только на `*.sovlium.ru` (+ local schemes);
   остальной http(s) открывается в системном браузере.
7. Capability `remote-ui` разрешает IPC с remote origin.
8. В WebView выставляется `__SOVLIUM_NATIVE__`; Яндекс.Метрика не инициализируется.

Файл совместимости лежит в `apps/xi.web/public/native-compat.json` и должен
деплоиться вместе с web. Пока `minShellVersion` = `0.0.0` (ворота открыты).

### Камера и микрофон

Для `getUserMedia` / LiveKit в нативной оболочке:

**macOS / iOS**

- `src-tauri/Info.plist` (macOS) и `src-tauri/Info.ios.plist` (iOS) —
  `NSCameraUsageDescription` / `NSMicrophoneUsageDescription`
  (иначе TCC / iOS privacy не показывает диалог);
- macOS: `src-tauri/Entitlements.plist` — `device.camera` + `device.audio-input`
  (Hardened Runtime), подключён через `tauri.macos.conf.json` → `bundle.macOS.entitlements`.
- Демонстрация экрана — только desktop (`NSScreenCaptureUsageDescription`).
  На iOS / Android `getDisplayMedia` недоступен в WebView (`unsupported`).

**Android** (после `pnpm --filter xi.tauri android:init`) в
`src-tauri/gen/android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Перед `getUserMedia` `common.platform` вызывает Rust-команды `media_permission_*`:
на Apple — AVFoundation (и Screen Recording на macOS), на Android WebView
показывает системный диалог при самом capture.

### Оверлей демонстрации экрана (Zoom-like)

При старте screen share в desktop-shell показывается always-on-top панель
(`share-overlay.html`): «Демонстрация экрана», **В звонок**, **Остановить**.

- Capture по-прежнему через LiveKit / `getDisplayMedia` (перед вызовом
  `common.platform` запрашивает Screen Recording на macOS через TCC).
- Мост: `modules.calls` → `common.platform` (`showShareOverlay`) → IPC `share_overlay_*`.
- Stop с панели эмитит `share-overlay-stop` → `setScreenShareEnabled(false)`.
- Нужен `NSScreenCaptureUsageDescription` в `Info.plist` (Screen Recording).

## Self-updater и CI/CD (Windows / macOS)

Автообновление **только desktop**. iOS / Android — App Store / Play Store.

Схема: **GitHub Actions собирает** → **статический JSON + бандлы на `releases.sovlium.ru`**.
GitHub Releases оставляем как страницу скачивания, но **не как CDN updater’а**: у
приватного репозитория ассеты закрыты, приложение не сможет их скачать без токена.

### Что уже в коде

- Клиент: splash вызывает `checkAndApplyUpdate` (бюджет 12 с), локальный бандл —
  отложенная проверка через 4 с.
- Endpoint: `https://releases.sovlium.ru/desktop/latest.json` (запасной URL с
  `{{target}}/{{arch}}/{{current_version}}` — тот же `latest.json` через nginx).
- Подпись: `plugins.updater.pubkey` в `tauri.conf.json`. Приватный ключ только в
  GitHub Secrets.
- Релизный workflow: `.github/workflows/xi_tauri_release.yml`.
- Локальный `pnpm tauri:build` **не** пишет `.sig` (`createUpdaterArtifacts: false`).
  Подписи включаются в CI через `tauri.updater-artifacts.conf.json`.

### Однократная настройка

```bash
pnpm --filter xi.tauri tauri signer generate -w apps/xi.tauri/src-tauri/.keys/sovlium.key
```

1. Публичный ключ — уже в `tauri.conf.json` (при ротации — заменить).
2. Приватный ключ → секрет `TAURI_SIGNING_PRIVATE_KEY`, пароль →
   `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.
3. На сервере: корень статики, например `/var/www/releases.sovlium.ru`.
4. В GitHub Environment `xi-production` переменная `RELEASES_REMOTE_PATH` =
   этот корень (rsync кладёт `desktop/`). SSH-секреты те же, что у деплоя `xi.web`.
5. Nginx (минимум):

```nginx
server {
  server_name releases.sovlium.ru;
  root /var/www/releases.sovlium.ru;
  location /desktop/ {
    try_files $uri $uri/ /desktop/latest.json;
    add_header Access-Control-Allow-Origin *;
    types { application/json json; }
  }
}
```

CORS `*` нужен, если когда-нибудь будете проверять манифест из браузера; самому
плагину updater он не обязателен.

### Как выкатить версию

Версия в git остаётся `0.0.0`. Реальный номер берётся из тега.

```bash
git tag xi.tauri-v0.1.0
git push origin xi.tauri-v0.1.0
```

или Actions → **xi.tauri Desktop Release** → tag `xi.tauri-v0.1.0`.

CI: macOS universal + Windows x64 → GitHub Release (draft) → `latest.json` +
файлы на `releases.sovlium.ru/desktop/`.

Проверка манифеста: `curl -sS https://releases.sovlium.ru/desktop/latest.json`.

### GitHub Free vs свой раннер

|                   | GitHub-hosted                                   | Свой Mac/Windows           |
| ----------------- | ----------------------------------------------- | -------------------------- |
| Деньги            | бесплатные минуты (macOS считается ×10)         | железо своё                |
| Подпись Apple     | сертификат в secrets, notarisation с Mac runner | проще notarize локально    |
| Когда имеет смысл | редкие релизы                                   | частые сборки / мало минут |

На Free-плане macOS-сборки быстро съедают квоту. Если упрётесь — поставьте
self-hosted runner с `runs-on: [self-hosted, macOS]` в матрице.

### PR / main

Полный `tauri build` на каждый PR не гоняем. Если меняются `apps/xi.tauri/**`
или общий frontend, `main.yml` делает `pnpm --filter xi.tauri check-types`.

### UX обновления

- Splash: «Проверяем обновления оболочки…», silent download.
- События: `sovlium:update-progress`, `sovlium:update-ready` — toast
  «перезапустить» → `applyPendingRestart()`.
- Код-сайнинг Apple/Windows **не обязателен** для updater’а (его подписывает
  minisign-ключ Tauri), но без Developer ID / Authenticode Gatekeeper и SmartScreen
  будут ругаться на первый установщик.

## Mobile

iOS / Android собирают тот же frontend bundle, что и desktop, но **без**
updater’а — обновления идут через App Store / Play Store. Это решение
зафиксировано тремя слоями:

- `platform/mobile.ts` -> `capabilities.updater = false`,
- `tauri.{ios,android}.conf.json` -> `plugins.updater.active = false`,
- `Cargo.toml` -> `tauri-plugin-updater` выключен под `cfg(any(target_os = "ios", target_os = "android"))`.

После `pnpm ios:init` / `pnpm android:init` папка `src-tauri/gen/` появится
локально — она в `.gitignore`, чтобы не тянуть в репо платформенные проекты,
которые проще регенерировать.

## Code signing (production)

| Платформа | Минимум для notarisation                                            |
| --------- | ------------------------------------------------------------------- |
| macOS     | Apple Developer ID Application cert, App-Specific Password, Team ID |
| Windows   | OV/EV Authenticode cert (Azure Code Signing / SafeNet / .pfx)       |
| iOS       | Apple Developer Program + распределённый Distribution Certificate   |
| Android   | Keystore (`*.jks`) + alias/passwords                                |

Все секреты подгружаются workflow `xi_tauri_release.yml` через GitHub Secrets —
никаких локальных файлов в репозитории.

## Что не делать

- Не импортировать что-либо из `apps/xi.tauri/src/tauri/*` в `xi.web`. Этот
  код существует только в контексте native shell’а. Общие адаптеры WebAPI
  живут в `packages/common.platform`.
- Не дублировать `pages.*`/`modules.*` в `apps/xi.tauri/src/`. Если нужна
  страница, специфичная только для нативной оболочки (например, экран
  «обновляемся…») — её можно добавить рядом с `App.tsx`, но не в `web/pages/`.
- Не добавлять зависимости в `xi.web/package.json`, чтобы пробросить что-то в
  Tauri. Если зависимость нужна обоим — она поднимается в shared-пакет.

## Дальнейшие шаги (roadmap)

- Кастомный update-banner в `common.ui`, который слушает события
  `sovlium:update-*` и работает только когда `getPlatform().kind === 'desktop'`.
- Tray icon + start-on-boot для desktop (через `setup/tray.rs`).
- Mobile deep-link обработчик в `setup/deep_links.rs`.
- Headless smoke test через `tauri-driver` в CI.
