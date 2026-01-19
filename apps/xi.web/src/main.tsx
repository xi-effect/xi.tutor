import ReactDOM from 'react-dom/client';
import './index.css';
import { i18nInitPromise } from './config/i18n';
import { initGlitchTip } from './config/glitchtip';
import { AppProviders } from './providers';

// Инициализируем GlitchTip как можно раньше
initGlitchTip();

// Нормализуем путь для Electron (file:// протокол) - используем hash routing
// При загрузке через file://, window.location.pathname содержит полный путь к файлу
// Переключаемся на hash routing для надёжной работы с file:// протоколом
if (
  typeof window !== 'undefined' &&
  'electronAPI' in window &&
  window.location.protocol === 'file:'
) {
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;

  // Если путь содержит index.html или это абсолютный путь, переключаемся на hash routing
  if (currentPath.includes('index.html') || currentPath.match(/^\/[A-Za-z]/)) {
    // Если hash пустой или только '#', устанавливаем '#/'
    if (!currentHash || currentHash === '#') {
      window.location.hash = '#/';
    }

    // Нормализуем pathname для роутера - заменяем на '/'
    window.history.replaceState(null, '', '/');
  }
}

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
