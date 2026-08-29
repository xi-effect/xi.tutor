import { reloadOnceOnStaleChunk } from 'common.utils';

/**
 * Официальный хук Vite: после деплоя старые hashed-чанки отдают 404,
 * и `__vitePreload` шлёт `vite:preloadError`. Перезагружаем вкладку,
 * чтобы подтянуть новый index.html и актуальные ассеты.
 * @see https://vitejs.dev/guide/build#load-error-handling
 */
export const installStaleChunkReload = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnceOnStaleChunk()) {
      event.preventDefault();
    }
  });
};

installStaleChunkReload();
