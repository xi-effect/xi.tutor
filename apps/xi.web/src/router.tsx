import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { ErrorPage } from 'common.ui';

// Определяем, работает ли приложение в Electron
// Используем безопасную проверку через 'in' оператор, чтобы избежать ошибок TypeScript
// Типы для window.electronAPI объявлены глобально в src/electron.d.ts
const isElectron =
  typeof window !== 'undefined' && 'electronAPI' in window && window.electronAPI !== undefined;

// Перехватываем чтение location.pathname для Electron через переопределение геттера
// TanStack Router читает путь из location.pathname, поэтому перехватываем его чтение
// Это позволяет роутеру читать путь из hash вместо полного пути к файлу
if (isElectron && typeof window !== 'undefined') {
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;

  // Если путь содержит index.html или это абсолютный путь, переключаемся на hash routing
  if (currentPath.includes('index.html') || currentPath.match(/^\/[A-Za-z]/)) {
    // Если hash пустой или только '#', устанавливаем '#/'
    if (!currentHash || currentHash === '#') {
      window.location.hash = '#/';
    }

    // Перехватываем чтение location.pathname через переопределение геттера
    // Это позволит роутеру читать путь из hash вместо полного пути к файлу
    const getPathFromHash = () => {
      return window.location.hash.slice(1) || '/';
    };

    // Переопределяем pathname геттер
    try {
      Object.defineProperty(window.location, 'pathname', {
        get: () => getPathFromHash(),
        configurable: true,
        enumerable: true,
      });
    } catch (error) {
      // Если не удалось переопределить pathname, продолжаем работу
      // В этом случае роутинг может не работать корректно в Electron
      console.error('Error defining pathname:', error);
    }
  }
}

// Определяем базовый путь для роутера
// В Electron с file:// протоколом используем пустой basepath (hash routing)
// В веб-версии используем относительный путь
const getBasePath = () => {
  if (isElectron) {
    return '';
  }
  // В веб-версии используем относительный путь из vite.config.ts (base: './')
  return './';
};

const basePath = getBasePath();

// Create a new router instance
export const router = createRouter({
  routeTree,
  basepath: basePath,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
  defaultNotFoundComponent: () => {
    return (
      <ErrorPage
        title="Страница не найдена"
        errorCode={404}
        text="В адресе есть ошибка или страница удалена"
      />
    );
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  // Расширяем параметры поиска для всех маршрутов
  interface SearchParams {
    redirect?: string;
    profile?: string;
    carouselType?: 'horizontal' | 'vertical';
    tab?: string;
    goto?: string;
    call?: string;
    classroom?: string;
    role?: 'tutor' | 'student';
    recipient_invoice_id?: string;
    read_notification_id?: string;
  }
}
