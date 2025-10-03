/**
 * Конфигурация для сетки пользователей в ВКС
 */

export const GRID_CONFIG = {
  // Размеры тайлов
  TILE: {
    HEIGHT: 204,
    WIDTH: 294,
    MIN_HEIGHT: 144,
    MIN_WIDTH: 250,
    ASPECT_RATIO: 16 / 9,
  },

  // Брейкпоинты для адаптивности
  BREAKPOINTS: {
    xs: 360, // Мобильные телефоны
    sm: 640, // Планшеты
    md: 768, // Небольшие десктопы
    lg: 1024, // Десктопы
    xl: 1280, // Большие экраны
    '2xl': 1536, // Очень большие экраны
  },

  // Максимальное количество тайлов на странице
  MAX_TILES_PER_PAGE: {
    xs: 1,
    sm: 4,
    md: 6,
    lg: 9,
    xl: 12,
    '2xl': 16,
  },

  // Настройки пагинации
  PAGINATION: {
    SWIPE_THRESHOLD: 50,
    AUTO_HIDE_DELAY: 2000,
  },

  // Настройки карусели
  CAROUSEL: {
    SCROLL_BAR_WIDTH: 17,
    MIN_VISIBLE_TILES: 1,
  },
} as const;

export type GridBreakpoint = keyof typeof GRID_CONFIG.BREAKPOINTS;
export type GridConfig = typeof GRID_CONFIG;
