import './utils/installStaleChunkReload';
import ReactDOM from 'react-dom/client';
import './index.css';
import { i18nInitPromise } from './config/i18n';
import { initBugsink } from './config/bugsink';
import { AppProviders } from './providers';
import { installNativeWebApiBridges } from 'common.platform';

installNativeWebApiBridges();

// Инициализируем BUGSINK как можно раньше
initBugsink();

const I18N_BOOT_TIMEOUT_MS = 8_000;

// Ждем инициализации i18n перед рендерингом приложения, но не бесконечно:
// зависший чанк локалей иначе оставляет пустой #root.
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  let bootTimer = 0;
  const bootTimeout = new Promise<never>((_, reject) => {
    bootTimer = window.setTimeout(() => {
      reject(new Error('i18n boot timeout'));
    }, I18N_BOOT_TIMEOUT_MS);
  });

  const renderApp = () => {
    window.clearTimeout(bootTimer);
    const root = ReactDOM.createRoot(rootElement);
    root.render(<AppProviders />);
  };

  void Promise.race([i18nInitPromise, bootTimeout])
    .then(renderApp)
    .catch((error) => {
      console.error('Ошибка при инициализации i18n:', error);
      renderApp();
    });
}
