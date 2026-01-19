# Исправление белого экрана

## Проблема

Белый экран возникает из-за того, что в собранном `index.html` используются абсолютные пути (`/assets/...`), которые не работают с `file://` протоколом в Electron.

## Решение

Добавлен `base: './'` в `apps/xi.web/vite.config.ts` для использования относительных путей.

## Что нужно сделать

1. **Пересобрать веб-приложение:**

   ```bash
   cd apps/xi.web
   pnpm build
   ```

2. **Пересобрать Electron приложение:**

   ```bash
   cd apps/xi.desktop
   pnpm build
   ```

3. **Установить новую версию:**

   ```bash
   open release/Sovlium-1.0.0.dmg
   # Перетащите в Applications
   ```

4. **Проверить в DevTools:**
   - Откройте DevTools (`Cmd + Option + I`)
   - Проверьте вкладку **Network** - файлы должны загружаться
   - Проверьте вкладку **Console** - не должно быть ошибок о missing files

## Проверка

После пересборки в `apps/xi.web/build/index.html` должны быть относительные пути:

- `./assets/index-XXX.js` вместо `/assets/index-XXX.js`
- `./assets/index-XXX.css` вместо `/assets/index-XXX.css`

## Если проблема остаётся

1. Проверьте консоль на ошибки CORS или загрузки файлов
2. Убедитесь, что файлы находятся в `Resources/xi.web/build/`
3. Проверьте логи в терминале при запуске приложения
