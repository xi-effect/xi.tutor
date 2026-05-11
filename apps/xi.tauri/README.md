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
    │   └── mobile.json     — пустой, заготовка под iOS/Android
    ├── icons/README.md     — как сгенерировать иконки через `pnpm tauri icon`
    └── src/
        ├── main.rs
        ├── lib.rs          — Builder, плагины, single-instance, generate_handler!
        ├── commands/mod.rs — app_info, log_message
        └── setup/mod.rs    — placeholder под deep-links, tray и т.п.
```

### Принципы

- **Никаких дублей бизнес-логики.** Vite-alias `web/*` указывает на `apps/xi.web/src/*`,
  что позволяет переиспользовать `AppProviders`, `router`, `pages`, `config/i18n`,
  `config/bugsink`, страницы и провайдеры без изменений в самом `xi.web`. То же
  для Tailwind: `src/index.css` импортирует `../../xi.web/src/index.css`, и все
  `@source`-декларации Tailwind v4 продолжают работать.
- **Платформенный слой явный.** Любая логика, специфичная для desktop или
  mobile, проходит через `src/platform/*`. Никаких `if (window.__TAURI__)` по
  коду — только через `detectPlatform()` / `getPlatform()`.
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

| Режим             | Когда использовать                           | Как включить                        |
| ----------------- | -------------------------------------------- | ----------------------------------- |
| local (по умолч.) | Production desktop и mobile сборки           | Ничего не делать                    |
| remote            | QA канарейка против live-домена              | `VITE_TAURI_REMOTE_URL=https://...` |
| dev               | Разработка с HMR через Tauri host            | `pnpm tauri:dev`                    |
| dev:remote        | Native shell + удалённый URL для отладки CSP | `pnpm --filter xi.tauri dev:remote` |

## Self-updater (Windows / macOS)

### Локальная сборка без ключей

По умолчанию в `tauri.conf.json`:

- `bundle.createUpdaterArtifacts` выключен (`false`);
- поле `plugins.updater.pubkey` отсутствует.

Так можно собирать установщик командой `pnpm tauri:build` **без** переменной окружения `TAURI_SIGNING_PRIVATE_KEY`. Плагин updater в приложении остаётся включённым (эндпоинты заданы), но подписанные артефакты для канала обновлений не создаются, пока вы не включите их осознанно.

Когда появится пара ключей `tauri signer generate`: добавьте **публичный** ключ в `plugins.updater.pubkey`, поставьте `bundle.createUpdaterArtifacts: true`, задайте `TAURI_SIGNING_PRIVATE_KEY` в CI или локально — тогда билд начнёт выдавать `.sig` и обновления станут проверяемыми.

### Однократная настройка ключей

```bash
# Создаёт пару ключей: ~/.tauri/sovlium.key и sovlium.key.pub
pnpm --filter xi.tauri tauri signer generate -w ~/.tauri/sovlium.key
```

- Публичный ключ копируется в `src-tauri/tauri.conf.json -> plugins.updater.pubkey`.
- Включите `bundle.createUpdaterArtifacts: true` в том же файле (или отдельным merge-конфигом для релиза).
- Приватный ключ кладётся в GitHub Secrets как `TAURI_SIGNING_PRIVATE_KEY`
  (его пароль — в `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`).
- **Приватный ключ никогда не должен попадать в репозиторий.** `.gitignore`
  репо явно исключает `*.tauri.key`, `*.key`, `*.pem`.

### Endpoint

В `tauri.conf.json` указано:

```
https://releases.sovlium.ru/desktop/{{target}}/{{arch}}/{{current_version}}
```

Сервер на каждый GET должен вернуть JSON по схеме Tauri:

```json
{
  "version": "0.1.1",
  "notes": "Bug fixes",
  "pub_date": "2026-05-11T00:00:00Z",
  "platforms": {
    "darwin-aarch64": { "signature": "...", "url": "https://.../Sovlium_0.1.1_aarch64.app.tar.gz" },
    "windows-x86_64": { "signature": "...", "url": "https://.../Sovlium_0.1.1_x64-setup.nsis.zip" }
  }
}
```

Поднять такой endpoint можно тремя путями (любой подходит, выбирайте по
инфраструктуре):

1. **GitHub Releases + tauri-action.** Простейший путь: workflow в
   `.github/workflows/xi_tauri_release.yml` уже публикует артефакты и подписи
   как relase assets, а Tauri может читать JSON напрямую с GitHub.
2. **Свой CDN/object storage.** S3/MinIO с CloudFront перед ним; CI после
   сборки PUT’ает JSON-манифест по предсказуемому пути.
3. **Cargo crate `cloudflare-workers` или Nginx.** Если уже есть
   `releases.sovlium.ru` — поднять `try_files` на статический JSON.

### UX обновления (как в Discord)

- На старте десктоп-shell дожидается 4 секунды, затем `checkAndApplyUpdate({ silent: true })`.
- При обнаружении новой версии файл скачивается в фоне, прогресс летит через
  `window` event `sovlium:update-progress`.
- По окончании скачивания диспатчится `sovlium:update-ready`. UI (внутри
  `xi.web`) может показать toast «Доступно обновление — перезапустить?» и
  вызвать `applyPendingRestart()`.

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
  код существует только в контексте native shell’а.
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
