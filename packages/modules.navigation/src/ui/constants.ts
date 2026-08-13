/** Высота нижней панели навигации на мобильных (px). */
export const MOBILE_BOTTOM_BAR_HEIGHT = 64;

/** Страница доски: /board/:id, /materials/:id/board, /classrooms/:id/boards/:id */
export const isBoardPath = (pathname: string) =>
  /^\/board\/[^/]+/.test(pathname) ||
  /\/boards\/[^/]+/.test(pathname) ||
  /\/board\/?$/.test(pathname);

/** z-index drawer навигации — выше UI доски (z-40 внутри z-0) и нижней панели (z-30). */
export const NAV_DRAWER_Z_CLASS = 'z-50';

/**
 * Класс для DrawerContent в модуле навигации: панель не перекрывает MobileBottomBar.
 * Ограничение высоты + сдвиг снизу (панель рисуется над нижней панелью).
 */
export const DRAWER_CONTENT_ABOVE_BAR_CLASS = 'max-h-screen w-full';
