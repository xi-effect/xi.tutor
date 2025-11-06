import ReactDOM from 'react-dom/client';
import './index.css';
import { i18nInitPromise } from './config/i18n';
import { initGlitchTip } from './config/glitchtip';
import { AppProviders } from './providers';

// Инициализируем GlitchTip как можно раньше
initGlitchTip();

// Ждем инициализации i18n перед рендерингом приложения
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  i18nInitPromise
    .then(() => {
      const root = ReactDOM.createRoot(rootElement);
      root.render(<AppProviders />);
    })
    .catch((error) => {
      console.error('Ошибка при инициализации i18n:', error);
      // Рендерим приложение даже при ошибке инициализации i18n
      const root = ReactDOM.createRoot(rootElement);
      root.render(<AppProviders />);
    });
}
